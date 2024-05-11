import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface FeedItem {
	id: string;
	video_url: string;
	audio_url: string;
	image_url: string | null;
	image_large_url: string | null;
	is_video_pending: boolean;
	major_model_version: string;
	model_name: string;
	metadata: {
		tags: string;
		prompt: string;
		gpt_description_prompt: string;
		audio_prompt_id: string | null;
		history: string | null;
		concat_history: string | null;
		type: string;
		duration: number | null;
		refund_credits: number | null;
		stream: boolean;
		error_type: string | null;
		error_message: string | null;
	};
	is_liked: boolean;
	user_id: string;
	display_name: string;
	handle: string;
	is_handle_updated: boolean;
	is_trashed: boolean;
	reaction: string | null;
	created_at: string;
	status: string;
	title: string;
	play_count: number;
	upvote_count: number;
	is_public: boolean;
}

const createSession = async (cookie: string) => {
	const instance = axios.create({
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-site',
			'User-Agent':
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
			cookie,
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
	});

	const data = await instance.get('https://clerk.suno.com/v1/client?_clerk_js_version=4.72.3');
	const [session] = data?.data?.response?.sessions;

	await instance.post(
		`https://clerk.suno.com/v1/client/sessions/${session?.id}/touch?_clerk_js_version=4.72.2`,
	);
	const token_store = await instance.post(
		`https://clerk.suno.com/v1/client/sessions/${session?.id}/tokens?_clerk_js_version=4.72.2`,
	);

	return { jwt: token_store?.data?.jwt };
};

const generate = async ({
	prompt,
	jwt,
	make_instrumental,
	gpt_description_prompt,
}: {
	jwt: string;
	prompt: string;
	make_instrumental: boolean;
	gpt_description_prompt: string;
}): Promise<Array<string>> => {
	const instance = axios.create({
		headers: {
			Authorization: `Bearer ${jwt}`,
			'User-Agent':
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
		},
	});

	const create = await instance.post(`https://studio-api.suno.ai/api/generate/v2/`, {
		gpt_description_prompt,
		mv: 'chirp-v3-0',
		prompt,
		make_instrumental,
	});

	const clipIDs = create.data.clips.map((clip: any) => clip.id);

	await fetchFeedData(clipIDs, instance);

	return clipIDs.map((id: number) => `https://cdn1.suno.ai/${id}.mp3`);
};

async function fetchFeedData(ids: string[], instance: AxiosInstance): Promise<FeedItem[]> {
	try {
		const stringIds = ids.join(',');
		const url = `https://studio-api.suno.ai/api/feed/?ids=${encodeURIComponent(stringIds)}`;

		const response: AxiosResponse<FeedItem[]> = await instance.get(url, {});
		const data = response.data;

		// Check if any item is still in "queued" status
		const hasPendingItems = data.some((item) => item.status !== 'streaming');

		if (hasPendingItems) {
			// Extract ids of pending items
			const pendingIds = data.filter((item) => item.status !== 'complete').map((item) => item.id);
			// Recursive call to fetch data for pending items after a delay
			console.log('Fetching songs...');
			await delay(250); // Add delay of 250ms
			const pendingData = await fetchFeedData(pendingIds, instance);
			// Merge and return all data
			return data.concat(pendingData);
		} else {
			// All items are now in "streaming" status
			return data;
		}
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const generateSong = async (
	gpt_description_prompt: string,
	cookie: string,
	prompt = '',
	make_instrumental = true,
) => {
	const { jwt } = await createSession(cookie);
	return generate({
		prompt,
		jwt,
		make_instrumental,
		gpt_description_prompt,
	});
};
