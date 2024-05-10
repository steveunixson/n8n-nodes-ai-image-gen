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
}) => {
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

fetch(
	'https://clerk.suno.com/v1/client/sessions/sess_2gHldb6kAEgzgPQCOZCB9fTEUeJ/tokens?_clerk_js_version=4.72.3',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			'content-type': 'application/x-www-form-urlencoded',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-site',
			cookie:
				'__client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZ0hsYnRNQ1RnQ3lBOUFxR3ZORTUxc2Y2d2YiLCJyb3RhdGluZ190b2tlbiI6Im5iNXpuOWpsNzVhdTZsY3ZmNXNhb3h5YzB6eGFyMDR5MnNmYnF5c2kifQ.tPWd4Wz3W0cnXuWXPbZ2mUr8WXm31nvHWiV8osLioDVo800eU3ttuT9IGfM-h1rUgPXPn7015Yp_5HljCRZ_Vua-kaSbHRNUW66OTL1qmtIdgeS6ayqiZEZJ95giBTRdaapQoCb5TU_xwbH1qG4KW8ntR6tmB-vHsrnFp6LKRLWOYVLWL1UB__KN_mvWBfPuxRjPvstz5JIjzDoAKZV12ULx30Sw1PYimznFWUCpJp1Y3Q8xlmx-g3VGq3rbJJwgnaVfCkzcaxd_Q_tGjwGfjzIWAWnUfRI93YmxANbNlmAajbrDz354P5PH4IDbOkiTaEQP0XVWqSxLixoRLgYfHg; __client_uat=1715362471; _cfuvid=jZnT9E55ydzImRUv5m6hPOOp5YqB.qvAEKgPnMJLU9Y-1715367317164-0.0.1.1-604800000; __cf_bm=hjONFfPUGlvgtr5wsyUEmvMVytqU7DDjNB_cEzYwJXA-1715367416-1.0.1.1-d78kyldmzdbnXvQiwaenihc63zmILfBA4gbHikXzHiDTamtkny4V5ST38ihjGSzNiwbmliy5QPLzxZ78ROVbfg; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '',
		method: 'POST',
	},
);
fetch('https://studio-api.suno.ai/api/generate/v2/', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		authorization:
			'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
		'content-type': 'text/plain;charset=UTF-8',
		priority: 'u=1, i',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'cross-site',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: '{"gpt_description_prompt":"dota 2 forest ambient","mv":"chirp-v3-0","prompt":"","make_instrumental":true}',
	method: 'POST',
});
fetch('https://api-js.mixpanel.com/track/?verbose=1&ip=1&_=1715367666447', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22event%22%3A%20%22Song%20Successfully%20Created%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22htthsqgq96wnva3j%22%2C%22time%22%3A%201715367664.616%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22modelVersion%22%3A%20%22chirp-v3-0%22%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%2C%0A%20%20%20%20%7B%22event%22%3A%20%22Create%20Song%20Clicked%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22cuh3oo4udmduf9e5%22%2C%22time%22%3A%201715367664.701%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22descriptionLength%22%3A%2021%2C%22instrumental%22%3A%20true%2C%22isSimpleMode%22%3A%20true%2C%22lyricsLength%22%3A%200%2C%22modelVersion%22%3A%20%22chirp-v3-0%22%2C%22styleLength%22%3A%200%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%0A%5D',
	method: 'POST',
});
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			priority: 'u=1, i',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'OPTIONS',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch('https://cdn1.suno.ai/image_edc45de4-7111-423a-bfae-e66458e346a0.png', {
	headers: {
		accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		priority: 'i',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'image',
		'sec-fetch-mode': 'no-cors',
		'sec-fetch-site': 'cross-site',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://cdn1.suno.ai/image_0fcf8806-313a-4dc7-a39f-a5ac929f5f1d.png', {
	headers: {
		accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		priority: 'i',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'image',
		'sec-fetch-mode': 'no-cors',
		'sec-fetch-site': 'cross-site',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://suno.com/song/edc45de4-7111-423a-bfae-e66458e346a0?_rsc=s1xqo', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		'next-router-prefetch': '1',
		'next-router-state-tree':
			'%5B%22%22%2C%7B%22children%22%3A%5B%22(root)%22%2C%7B%22children%22%3A%5B%22create%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Fcreate%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D%7D%5D',
		'next-url': '/create',
		priority: 'u=1, i',
		rsc: '1',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'same-origin',
		cookie:
			'__client_uat=1715362471; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D; __session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
		Referer: 'https://suno.com/create',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://suno.com/song/0fcf8806-313a-4dc7-a39f-a5ac929f5f1d?_rsc=s1xqo', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		'next-router-prefetch': '1',
		'next-router-state-tree':
			'%5B%22%22%2C%7B%22children%22%3A%5B%22(root)%22%2C%7B%22children%22%3A%5B%22create%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Fcreate%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D%7D%5D',
		'next-url': '/create',
		priority: 'u=1, i',
		rsc: '1',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'same-origin',
		cookie:
			'__client_uat=1715362471; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D; __session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
		Referer: 'https://suno.com/create',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://clerk.suno.com/v1/client/sessions/sess_2gHldb6kAEgzgPQCOZCB9fTEUeJ/tokens?_clerk_js_version=4.72.3',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			'content-type': 'application/x-www-form-urlencoded',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-site',
			cookie:
				'__client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZ0hsYnRNQ1RnQ3lBOUFxR3ZORTUxc2Y2d2YiLCJyb3RhdGluZ190b2tlbiI6Im5iNXpuOWpsNzVhdTZsY3ZmNXNhb3h5YzB6eGFyMDR5MnNmYnF5c2kifQ.tPWd4Wz3W0cnXuWXPbZ2mUr8WXm31nvHWiV8osLioDVo800eU3ttuT9IGfM-h1rUgPXPn7015Yp_5HljCRZ_Vua-kaSbHRNUW66OTL1qmtIdgeS6ayqiZEZJ95giBTRdaapQoCb5TU_xwbH1qG4KW8ntR6tmB-vHsrnFp6LKRLWOYVLWL1UB__KN_mvWBfPuxRjPvstz5JIjzDoAKZV12ULx30Sw1PYimznFWUCpJp1Y3Q8xlmx-g3VGq3rbJJwgnaVfCkzcaxd_Q_tGjwGfjzIWAWnUfRI93YmxANbNlmAajbrDz354P5PH4IDbOkiTaEQP0XVWqSxLixoRLgYfHg; __client_uat=1715362471; _cfuvid=jZnT9E55ydzImRUv5m6hPOOp5YqB.qvAEKgPnMJLU9Y-1715367317164-0.0.1.1-604800000; __cf_bm=hjONFfPUGlvgtr5wsyUEmvMVytqU7DDjNB_cEzYwJXA-1715367416-1.0.1.1-d78kyldmzdbnXvQiwaenihc63zmILfBA4gbHikXzHiDTamtkny4V5ST38ihjGSzNiwbmliy5QPLzxZ78ROVbfg; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '',
		method: 'POST',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch('https://suno.com/profile.svg', {
	headers: {
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/create',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch(
	'https://studio-api.suno.ai/api/gen/0fcf8806-313a-4dc7-a39f-a5ac929f5f1d/increment_play_count/v2',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			priority: 'u=1, i',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'OPTIONS',
	},
);
fetch(
	'https://studio-api.suno.ai/api/gen/0fcf8806-313a-4dc7-a39f-a5ac929f5f1d/increment_play_count/v2',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			'content-type': 'text/plain;charset=UTF-8',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '{"sample_factor":1}',
		method: 'POST',
	},
);
fetch('https://cdn1.suno.ai/silence.mp3', {
	headers: {
		range: 'bytes=0-',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://audiopipe.suno.ai/?item_id=0fcf8806-313a-4dc7-a39f-a5ac929f5f1d', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		priority: 'i',
		range: 'bytes=0-',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'audio',
		'sec-fetch-mode': 'no-cors',
		'sec-fetch-site': 'cross-site',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://suno.com/favicon.ico', {
	headers: {
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/create',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch('https://api-js.mixpanel.com/engage/?verbose=1&ip=1&_=1715367711621', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22%24add%22%3A%20%7B%22User%3A%20Total%20Play%20Time%20in%20Seconds%22%3A%20155.5%7D%2C%22%24token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22%24distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D%0A%5D',
	method: 'POST',
});
fetch('https://api-js.mixpanel.com/track/?verbose=1&ip=1&_=1715367711623', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22event%22%3A%20%22Playbar%3A%20Tracking%20Song%20Time%20Elapsed%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22zmlt0mrtel53bnzi%22%2C%22time%22%3A%201715367707.158%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22secondsElapsed%22%3A%20155.5%2C%22songId%22%3A%20%220fcf8806-313a-4dc7-a39f-a5ac929f5f1d%22%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%2C%0A%20%20%20%20%7B%22event%22%3A%20%22Playbar%3A%20Song%20Started%20From%20Beginning%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22bff7mxkymoxgh6eg%22%2C%22time%22%3A%201715367708.314%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22songId%22%3A%20%220fcf8806-313a-4dc7-a39f-a5ac929f5f1d%22%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%0A%5D',
	method: 'POST',
});
fetch(
	'https://studio-api.suno.ai/api/gen/edc45de4-7111-423a-bfae-e66458e346a0/increment_play_count/v2',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			'content-type': 'text/plain;charset=UTF-8',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '{"sample_factor":1}',
		method: 'POST',
	},
);
fetch(
	'https://studio-api.suno.ai/api/gen/edc45de4-7111-423a-bfae-e66458e346a0/increment_play_count/v2',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			priority: 'u=1, i',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'OPTIONS',
	},
);
fetch('https://audiopipe.suno.ai/?item_id=edc45de4-7111-423a-bfae-e66458e346a0', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		priority: 'i',
		range: 'bytes=0-',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'audio',
		'sec-fetch-mode': 'no-cors',
		'sec-fetch-site': 'cross-site',
		cookie:
			'__cf_bm=uYGDvn_.XlFt2HQ01hrK0REdgcpwhj2LVvqvgd3uF0M-1715367708-1.0.1.1-6mcEnxB5Sh5hluAkXSAY.HD5Q5na.eTiZxXw3.beJKRW5k_6XcXr0vRJBOygcHNQXixLvbdUVMzPrqCAbKytog',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://api-js.mixpanel.com/engage/?verbose=1&ip=1&_=1715367716627', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22%24add%22%3A%20%7B%22User%3A%20Total%20Play%20Time%20in%20Seconds%22%3A%206.6%7D%2C%22%24token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22%24distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D%0A%5D',
	method: 'POST',
});
fetch('https://api-js.mixpanel.com/track/?verbose=1&ip=1&_=1715367716628', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22event%22%3A%20%22Playbar%3A%20Tracking%20Song%20Time%20Elapsed%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22t7oxuaoq3ib8gmv9%22%2C%22time%22%3A%201715367715.102%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22secondsElapsed%22%3A%206.6%2C%22songId%22%3A%20%22edc45de4-7111-423a-bfae-e66458e346a0%22%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%0A%5D',
	method: 'POST',
});
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://clerk.suno.com/v1/client/sessions/sess_2gHldb6kAEgzgPQCOZCB9fTEUeJ/tokens?_clerk_js_version=4.72.3',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			'content-type': 'application/x-www-form-urlencoded',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-site',
			cookie:
				'__client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZ0hsYnRNQ1RnQ3lBOUFxR3ZORTUxc2Y2d2YiLCJyb3RhdGluZ190b2tlbiI6Im5iNXpuOWpsNzVhdTZsY3ZmNXNhb3h5YzB6eGFyMDR5MnNmYnF5c2kifQ.tPWd4Wz3W0cnXuWXPbZ2mUr8WXm31nvHWiV8osLioDVo800eU3ttuT9IGfM-h1rUgPXPn7015Yp_5HljCRZ_Vua-kaSbHRNUW66OTL1qmtIdgeS6ayqiZEZJ95giBTRdaapQoCb5TU_xwbH1qG4KW8ntR6tmB-vHsrnFp6LKRLWOYVLWL1UB__KN_mvWBfPuxRjPvstz5JIjzDoAKZV12ULx30Sw1PYimznFWUCpJp1Y3Q8xlmx-g3VGq3rbJJwgnaVfCkzcaxd_Q_tGjwGfjzIWAWnUfRI93YmxANbNlmAajbrDz354P5PH4IDbOkiTaEQP0XVWqSxLixoRLgYfHg; __client_uat=1715362471; _cfuvid=jZnT9E55ydzImRUv5m6hPOOp5YqB.qvAEKgPnMJLU9Y-1715367317164-0.0.1.1-604800000; __cf_bm=hjONFfPUGlvgtr5wsyUEmvMVytqU7DDjNB_cEzYwJXA-1715367416-1.0.1.1-d78kyldmzdbnXvQiwaenihc63zmILfBA4gbHikXzHiDTamtkny4V5ST38ihjGSzNiwbmliy5QPLzxZ78ROVbfg; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '',
		method: 'POST',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc4MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2Nzc0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImQyZjI4ZWYxZTJjYTQ4NGYyNTMyIiwibmJmIjoxNzE1MzY3NzM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.CYKIARYSh3tSpRolmlX-d2kGmeHXuznZaGTAgKFuNyr02b19x9L5BmQKzw30dtYgI2ItOt9qXOG3WbUrZH6W_J3QYIUAhMd39_Mapf8DcuNwFE8zzdw5FgcLECePa8v3GXgB4e0BwfHhW4eKU65nYNjqalQ5jNyonH1Krl8rLM0jEXtIr4BN7_wAfAn8bdx8J7vq3Q7GVN9HV-VoFI93r7zuQeH1WTUVOP-43Wsj-shlJl06JeUM-NaTaysOCC42j3qa5XruN6Wh0G5py3H-kHZgnzObyP7Vp7vVQ5GSkkw0QbUiMEp2laOE3Szt69J_EVQR7zeJM1WwDbp-zabiew',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc4MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2Nzc0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImQyZjI4ZWYxZTJjYTQ4NGYyNTMyIiwibmJmIjoxNzE1MzY3NzM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.CYKIARYSh3tSpRolmlX-d2kGmeHXuznZaGTAgKFuNyr02b19x9L5BmQKzw30dtYgI2ItOt9qXOG3WbUrZH6W_J3QYIUAhMd39_Mapf8DcuNwFE8zzdw5FgcLECePa8v3GXgB4e0BwfHhW4eKU65nYNjqalQ5jNyonH1Krl8rLM0jEXtIr4BN7_wAfAn8bdx8J7vq3Q7GVN9HV-VoFI93r7zuQeH1WTUVOP-43Wsj-shlJl06JeUM-NaTaysOCC42j3qa5XruN6Wh0G5py3H-kHZgnzObyP7Vp7vVQ5GSkkw0QbUiMEp2laOE3Szt69J_EVQR7zeJM1WwDbp-zabiew',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc4MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2Nzc0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImQyZjI4ZWYxZTJjYTQ4NGYyNTMyIiwibmJmIjoxNzE1MzY3NzM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.CYKIARYSh3tSpRolmlX-d2kGmeHXuznZaGTAgKFuNyr02b19x9L5BmQKzw30dtYgI2ItOt9qXOG3WbUrZH6W_J3QYIUAhMd39_Mapf8DcuNwFE8zzdw5FgcLECePa8v3GXgB4e0BwfHhW4eKU65nYNjqalQ5jNyonH1Krl8rLM0jEXtIr4BN7_wAfAn8bdx8J7vq3Q7GVN9HV-VoFI93r7zuQeH1WTUVOP-43Wsj-shlJl06JeUM-NaTaysOCC42j3qa5XruN6Wh0G5py3H-kHZgnzObyP7Vp7vVQ5GSkkw0QbUiMEp2laOE3Szt69J_EVQR7zeJM1WwDbp-zabiew',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);

fetch(
	'https://clerk.suno.com/v1/client/sessions/sess_2gHldb6kAEgzgPQCOZCB9fTEUeJ/tokens?_clerk_js_version=4.72.3',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			'content-type': 'application/x-www-form-urlencoded',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-site',
			cookie:
				'__client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZ0hsYnRNQ1RnQ3lBOUFxR3ZORTUxc2Y2d2YiLCJyb3RhdGluZ190b2tlbiI6Im5iNXpuOWpsNzVhdTZsY3ZmNXNhb3h5YzB6eGFyMDR5MnNmYnF5c2kifQ.tPWd4Wz3W0cnXuWXPbZ2mUr8WXm31nvHWiV8osLioDVo800eU3ttuT9IGfM-h1rUgPXPn7015Yp_5HljCRZ_Vua-kaSbHRNUW66OTL1qmtIdgeS6ayqiZEZJ95giBTRdaapQoCb5TU_xwbH1qG4KW8ntR6tmB-vHsrnFp6LKRLWOYVLWL1UB__KN_mvWBfPuxRjPvstz5JIjzDoAKZV12ULx30Sw1PYimznFWUCpJp1Y3Q8xlmx-g3VGq3rbJJwgnaVfCkzcaxd_Q_tGjwGfjzIWAWnUfRI93YmxANbNlmAajbrDz354P5PH4IDbOkiTaEQP0XVWqSxLixoRLgYfHg; __client_uat=1715362471; _cfuvid=jZnT9E55ydzImRUv5m6hPOOp5YqB.qvAEKgPnMJLU9Y-1715367317164-0.0.1.1-604800000; __cf_bm=hjONFfPUGlvgtr5wsyUEmvMVytqU7DDjNB_cEzYwJXA-1715367416-1.0.1.1-d78kyldmzdbnXvQiwaenihc63zmILfBA4gbHikXzHiDTamtkny4V5ST38ihjGSzNiwbmliy5QPLzxZ78ROVbfg; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '',
		method: 'POST',
	},
);
fetch('https://studio-api.suno.ai/api/generate/v2/', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		authorization:
			'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
		'content-type': 'text/plain;charset=UTF-8',
		priority: 'u=1, i',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'cross-site',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: '{"gpt_description_prompt":"dota 2 forest ambient","mv":"chirp-v3-0","prompt":"","make_instrumental":true}',
	method: 'POST',
});
fetch('https://api-js.mixpanel.com/track/?verbose=1&ip=1&_=1715367666447', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22event%22%3A%20%22Song%20Successfully%20Created%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22htthsqgq96wnva3j%22%2C%22time%22%3A%201715367664.616%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22modelVersion%22%3A%20%22chirp-v3-0%22%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%2C%0A%20%20%20%20%7B%22event%22%3A%20%22Create%20Song%20Clicked%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22cuh3oo4udmduf9e5%22%2C%22time%22%3A%201715367664.701%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22descriptionLength%22%3A%2021%2C%22instrumental%22%3A%20true%2C%22isSimpleMode%22%3A%20true%2C%22lyricsLength%22%3A%200%2C%22modelVersion%22%3A%20%22chirp-v3-0%22%2C%22styleLength%22%3A%200%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%0A%5D',
	method: 'POST',
});
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			priority: 'u=1, i',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'OPTIONS',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch('https://cdn1.suno.ai/image_edc45de4-7111-423a-bfae-e66458e346a0.png', {
	headers: {
		accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		priority: 'i',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'image',
		'sec-fetch-mode': 'no-cors',
		'sec-fetch-site': 'cross-site',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://cdn1.suno.ai/image_0fcf8806-313a-4dc7-a39f-a5ac929f5f1d.png', {
	headers: {
		accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		priority: 'i',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'image',
		'sec-fetch-mode': 'no-cors',
		'sec-fetch-site': 'cross-site',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://suno.com/song/edc45de4-7111-423a-bfae-e66458e346a0?_rsc=s1xqo', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		'next-router-prefetch': '1',
		'next-router-state-tree':
			'%5B%22%22%2C%7B%22children%22%3A%5B%22(root)%22%2C%7B%22children%22%3A%5B%22create%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Fcreate%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D%7D%5D',
		'next-url': '/create',
		priority: 'u=1, i',
		rsc: '1',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'same-origin',
		cookie:
			'__client_uat=1715362471; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D; __session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
		Referer: 'https://suno.com/create',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://suno.com/song/0fcf8806-313a-4dc7-a39f-a5ac929f5f1d?_rsc=s1xqo', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		'next-router-prefetch': '1',
		'next-router-state-tree':
			'%5B%22%22%2C%7B%22children%22%3A%5B%22(root)%22%2C%7B%22children%22%3A%5B%22create%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Fcreate%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D%7D%5D',
		'next-url': '/create',
		priority: 'u=1, i',
		rsc: '1',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'same-origin',
		cookie:
			'__client_uat=1715362471; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D; __session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
		Referer: 'https://suno.com/create',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImZjZmMxZmMyYzM3YjM3MmNmODZiIiwibmJmIjoxNzE1MzY3NjM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.ghoKcw2QEKO1MUkwlY5OaB2XYOsjiiS2jA5TVuHfIxYF0r-l6D7QCMjiSacQful0EDneiB91pH6M22LLSlEjoCiIWU0HtnGEoiYVfITYrkr4T_qYc3UTUejGdsSGgKycevp_0d3hEL-R0oI5FTBgzLnBfROcS2bNbUIZfKFLgdZNdqGraef25GsUkpbS2ziHJsnxJVBMjRFcJiDMuAngM1fAW1r5ABQqkaEsPnUmR0HvF_leI2G4f71wJ2Ex8pHlgxId2epadfs6q6xIcJKlVejNefKr3oP8etdLogx9JyGXhMXz3c7TUZPzBJUkMzmQsn362MPhSLdSVj6FeGh0Ng',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://clerk.suno.com/v1/client/sessions/sess_2gHldb6kAEgzgPQCOZCB9fTEUeJ/tokens?_clerk_js_version=4.72.3',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			'content-type': 'application/x-www-form-urlencoded',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-site',
			cookie:
				'__client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZ0hsYnRNQ1RnQ3lBOUFxR3ZORTUxc2Y2d2YiLCJyb3RhdGluZ190b2tlbiI6Im5iNXpuOWpsNzVhdTZsY3ZmNXNhb3h5YzB6eGFyMDR5MnNmYnF5c2kifQ.tPWd4Wz3W0cnXuWXPbZ2mUr8WXm31nvHWiV8osLioDVo800eU3ttuT9IGfM-h1rUgPXPn7015Yp_5HljCRZ_Vua-kaSbHRNUW66OTL1qmtIdgeS6ayqiZEZJ95giBTRdaapQoCb5TU_xwbH1qG4KW8ntR6tmB-vHsrnFp6LKRLWOYVLWL1UB__KN_mvWBfPuxRjPvstz5JIjzDoAKZV12ULx30Sw1PYimznFWUCpJp1Y3Q8xlmx-g3VGq3rbJJwgnaVfCkzcaxd_Q_tGjwGfjzIWAWnUfRI93YmxANbNlmAajbrDz354P5PH4IDbOkiTaEQP0XVWqSxLixoRLgYfHg; __client_uat=1715362471; _cfuvid=jZnT9E55ydzImRUv5m6hPOOp5YqB.qvAEKgPnMJLU9Y-1715367317164-0.0.1.1-604800000; __cf_bm=hjONFfPUGlvgtr5wsyUEmvMVytqU7DDjNB_cEzYwJXA-1715367416-1.0.1.1-d78kyldmzdbnXvQiwaenihc63zmILfBA4gbHikXzHiDTamtkny4V5ST38ihjGSzNiwbmliy5QPLzxZ78ROVbfg; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '',
		method: 'POST',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch('https://suno.com/profile.svg', {
	headers: {
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/create',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch(
	'https://studio-api.suno.ai/api/gen/0fcf8806-313a-4dc7-a39f-a5ac929f5f1d/increment_play_count/v2',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			priority: 'u=1, i',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'OPTIONS',
	},
);
fetch(
	'https://studio-api.suno.ai/api/gen/0fcf8806-313a-4dc7-a39f-a5ac929f5f1d/increment_play_count/v2',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			'content-type': 'text/plain;charset=UTF-8',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '{"sample_factor":1}',
		method: 'POST',
	},
);
fetch('https://cdn1.suno.ai/silence.mp3', {
	headers: {
		range: 'bytes=0-',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://audiopipe.suno.ai/?item_id=0fcf8806-313a-4dc7-a39f-a5ac929f5f1d', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		priority: 'i',
		range: 'bytes=0-',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'audio',
		'sec-fetch-mode': 'no-cors',
		'sec-fetch-site': 'cross-site',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://suno.com/favicon.ico', {
	headers: {
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/create',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch('https://api-js.mixpanel.com/engage/?verbose=1&ip=1&_=1715367711621', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22%24add%22%3A%20%7B%22User%3A%20Total%20Play%20Time%20in%20Seconds%22%3A%20155.5%7D%2C%22%24token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22%24distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D%0A%5D',
	method: 'POST',
});
fetch('https://api-js.mixpanel.com/track/?verbose=1&ip=1&_=1715367711623', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22event%22%3A%20%22Playbar%3A%20Tracking%20Song%20Time%20Elapsed%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22zmlt0mrtel53bnzi%22%2C%22time%22%3A%201715367707.158%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22secondsElapsed%22%3A%20155.5%2C%22songId%22%3A%20%220fcf8806-313a-4dc7-a39f-a5ac929f5f1d%22%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%2C%0A%20%20%20%20%7B%22event%22%3A%20%22Playbar%3A%20Song%20Started%20From%20Beginning%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22bff7mxkymoxgh6eg%22%2C%22time%22%3A%201715367708.314%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22songId%22%3A%20%220fcf8806-313a-4dc7-a39f-a5ac929f5f1d%22%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%0A%5D',
	method: 'POST',
});
fetch(
	'https://studio-api.suno.ai/api/gen/edc45de4-7111-423a-bfae-e66458e346a0/increment_play_count/v2',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			'content-type': 'text/plain;charset=UTF-8',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '{"sample_factor":1}',
		method: 'POST',
	},
);
fetch(
	'https://studio-api.suno.ai/api/gen/edc45de4-7111-423a-bfae-e66458e346a0/increment_play_count/v2',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			priority: 'u=1, i',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'OPTIONS',
	},
);
fetch('https://audiopipe.suno.ai/?item_id=edc45de4-7111-423a-bfae-e66458e346a0', {
	headers: {
		accept: '*/*',
		'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
		priority: 'i',
		range: 'bytes=0-',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		'sec-fetch-dest': 'audio',
		'sec-fetch-mode': 'no-cors',
		'sec-fetch-site': 'cross-site',
		cookie:
			'__cf_bm=uYGDvn_.XlFt2HQ01hrK0REdgcpwhj2LVvqvgd3uF0M-1715367708-1.0.1.1-6mcEnxB5Sh5hluAkXSAY.HD5Q5na.eTiZxXw3.beJKRW5k_6XcXr0vRJBOygcHNQXixLvbdUVMzPrqCAbKytog',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: null,
	method: 'GET',
});
fetch('https://api-js.mixpanel.com/engage/?verbose=1&ip=1&_=1715367716627', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22%24add%22%3A%20%7B%22User%3A%20Total%20Play%20Time%20in%20Seconds%22%3A%206.6%7D%2C%22%24token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22%24distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D%0A%5D',
	method: 'POST',
});
fetch('https://api-js.mixpanel.com/track/?verbose=1&ip=1&_=1715367716628', {
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Linux"',
		Referer: 'https://suno.com/',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	},
	body: 'data=%5B%0A%20%20%20%20%7B%22event%22%3A%20%22Playbar%3A%20Tracking%20Song%20Time%20Elapsed%22%2C%22properties%22%3A%20%7B%22%24os%22%3A%20%22Linux%22%2C%22%24browser%22%3A%20%22Chrome%22%2C%22%24referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24referring_domain%22%3A%20%22suno.com%22%2C%22%24current_url%22%3A%20%22https%3A%2F%2Fsuno.com%2Fcreate%22%2C%22%24browser_version%22%3A%20124%2C%22%24screen_height%22%3A%201080%2C%22%24screen_width%22%3A%201920%2C%22mp_lib%22%3A%20%22web%22%2C%22%24lib_version%22%3A%20%222.48.1%22%2C%22%24insert_id%22%3A%20%22t7oxuaoq3ib8gmv9%22%2C%22time%22%3A%201715367715.102%2C%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22secondsElapsed%22%3A%206.6%2C%22songId%22%3A%20%22edc45de4-7111-423a-bfae-e66458e346a0%22%2C%22token%22%3A%20%2226ced217328f4737497bd6ba6641ca1c%22%2C%22mp_sent_by_lib_version%22%3A%20%222.48.1%22%7D%7D%0A%5D',
	method: 'POST',
});
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc3NTcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2NzY5NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjdiZDdjZjU4M2E1MDRkYzIwZGVhIiwibmJmIjoxNzE1MzY3Njg3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.IZsrGSfXVySbIvStzNOiSojKH7TEbSkHbbOePx2bhV18SB8AXMv6OnvAcEfjsdAtujylMpR9BtZDgu_HyBYE_T75-7EbK62WXnTaXIkIET-YbpRYhOWjrKkrtplK_E1mpKF8XNhPcJOEj3EmuNtXU0c_lB_edQ0zhnWiCDhw7vGnP1VU_Q9LeCvSj4yBuHM8Rv5SAHZcj4MET8Y4x-eMURL00oIVNE7mz17vj8SfrX5LkAewNjU6cMS2jRO0BXeuSjqmuEa5P-WrR3QWzDbmc3Qa1bhNG6T12QJNTciPi0KkmKPWPi--1T5-g4HIMHfrcuOPBwNslJ-lEHd3Y59Esw',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://clerk.suno.com/v1/client/sessions/sess_2gHldb6kAEgzgPQCOZCB9fTEUeJ/tokens?_clerk_js_version=4.72.3',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			'content-type': 'application/x-www-form-urlencoded',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-site',
			cookie:
				'__client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZ0hsYnRNQ1RnQ3lBOUFxR3ZORTUxc2Y2d2YiLCJyb3RhdGluZ190b2tlbiI6Im5iNXpuOWpsNzVhdTZsY3ZmNXNhb3h5YzB6eGFyMDR5MnNmYnF5c2kifQ.tPWd4Wz3W0cnXuWXPbZ2mUr8WXm31nvHWiV8osLioDVo800eU3ttuT9IGfM-h1rUgPXPn7015Yp_5HljCRZ_Vua-kaSbHRNUW66OTL1qmtIdgeS6ayqiZEZJ95giBTRdaapQoCb5TU_xwbH1qG4KW8ntR6tmB-vHsrnFp6LKRLWOYVLWL1UB__KN_mvWBfPuxRjPvstz5JIjzDoAKZV12ULx30Sw1PYimznFWUCpJp1Y3Q8xlmx-g3VGq3rbJJwgnaVfCkzcaxd_Q_tGjwGfjzIWAWnUfRI93YmxANbNlmAajbrDz354P5PH4IDbOkiTaEQP0XVWqSxLixoRLgYfHg; __client_uat=1715362471; _cfuvid=jZnT9E55ydzImRUv5m6hPOOp5YqB.qvAEKgPnMJLU9Y-1715367317164-0.0.1.1-604800000; __cf_bm=hjONFfPUGlvgtr5wsyUEmvMVytqU7DDjNB_cEzYwJXA-1715367416-1.0.1.1-d78kyldmzdbnXvQiwaenihc63zmILfBA4gbHikXzHiDTamtkny4V5ST38ihjGSzNiwbmliy5QPLzxZ78ROVbfg; __cf_bm=WfC1g9I5mqg9m.5yEwiyLIq2jig_SkFL4cO5QjP.kCY-1715367450-1.0.1.1-5UYBVczcdjVLY3XWQ6pmm22gHhxhPDYbT9Y_HKzd5Am8gVY1tBPPsstjQUMPSotonIrEM5FKYAA_EBiu1LY4tw; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: '',
		method: 'POST',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc4MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2Nzc0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImQyZjI4ZWYxZTJjYTQ4NGYyNTMyIiwibmJmIjoxNzE1MzY3NzM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.CYKIARYSh3tSpRolmlX-d2kGmeHXuznZaGTAgKFuNyr02b19x9L5BmQKzw30dtYgI2ItOt9qXOG3WbUrZH6W_J3QYIUAhMd39_Mapf8DcuNwFE8zzdw5FgcLECePa8v3GXgB4e0BwfHhW4eKU65nYNjqalQ5jNyonH1Krl8rLM0jEXtIr4BN7_wAfAn8bdx8J7vq3Q7GVN9HV-VoFI93r7zuQeH1WTUVOP-43Wsj-shlJl06JeUM-NaTaysOCC42j3qa5XruN6Wh0G5py3H-kHZgnzObyP7Vp7vVQ5GSkkw0QbUiMEp2laOE3Szt69J_EVQR7zeJM1WwDbp-zabiew',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc4MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2Nzc0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImQyZjI4ZWYxZTJjYTQ4NGYyNTMyIiwibmJmIjoxNzE1MzY3NzM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.CYKIARYSh3tSpRolmlX-d2kGmeHXuznZaGTAgKFuNyr02b19x9L5BmQKzw30dtYgI2ItOt9qXOG3WbUrZH6W_J3QYIUAhMd39_Mapf8DcuNwFE8zzdw5FgcLECePa8v3GXgB4e0BwfHhW4eKU65nYNjqalQ5jNyonH1Krl8rLM0jEXtIr4BN7_wAfAn8bdx8J7vq3Q7GVN9HV-VoFI93r7zuQeH1WTUVOP-43Wsj-shlJl06JeUM-NaTaysOCC42j3qa5XruN6Wh0G5py3H-kHZgnzObyP7Vp7vVQ5GSkkw0QbUiMEp2laOE3Szt69J_EVQR7zeJM1WwDbp-zabiew',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc4MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2Nzc0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImQyZjI4ZWYxZTJjYTQ4NGYyNTMyIiwibmJmIjoxNzE1MzY3NzM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.CYKIARYSh3tSpRolmlX-d2kGmeHXuznZaGTAgKFuNyr02b19x9L5BmQKzw30dtYgI2ItOt9qXOG3WbUrZH6W_J3QYIUAhMd39_Mapf8DcuNwFE8zzdw5FgcLECePa8v3GXgB4e0BwfHhW4eKU65nYNjqalQ5jNyonH1Krl8rLM0jEXtIr4BN7_wAfAn8bdx8J7vq3Q7GVN9HV-VoFI93r7zuQeH1WTUVOP-43Wsj-shlJl06JeUM-NaTaysOCC42j3qa5XruN6Wh0G5py3H-kHZgnzObyP7Vp7vVQ5GSkkw0QbUiMEp2laOE3Szt69J_EVQR7zeJM1WwDbp-zabiew',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc4MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2Nzc0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImQyZjI4ZWYxZTJjYTQ4NGYyNTMyIiwibmJmIjoxNzE1MzY3NzM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.CYKIARYSh3tSpRolmlX-d2kGmeHXuznZaGTAgKFuNyr02b19x9L5BmQKzw30dtYgI2ItOt9qXOG3WbUrZH6W_J3QYIUAhMd39_Mapf8DcuNwFE8zzdw5FgcLECePa8v3GXgB4e0BwfHhW4eKU65nYNjqalQ5jNyonH1Krl8rLM0jEXtIr4BN7_wAfAn8bdx8J7vq3Q7GVN9HV-VoFI93r7zuQeH1WTUVOP-43Wsj-shlJl06JeUM-NaTaysOCC42j3qa5XruN6Wh0G5py3H-kHZgnzObyP7Vp7vVQ5GSkkw0QbUiMEp2laOE3Szt69J_EVQR7zeJM1WwDbp-zabiew',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);
fetch(
	'https://studio-api.suno.ai/api/feed/?ids=edc45de4-7111-423a-bfae-e66458e346a0%2C0fcf8806-313a-4dc7-a39f-a5ac929f5f1d',
	{
		headers: {
			accept: '*/*',
			'accept-language': 'ru,en-US;q=0.9,en;q=0.8,id;q=0.7',
			authorization:
				'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MTUzNjc4MDcsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJmeTdlZXRkcU5iNUZ0MUVrRmphUWhmNmRXNyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJ1bml4c29uQGdtYWlsLmNvbSIsImlhdCI6MTcxNTM2Nzc0NywiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6ImQyZjI4ZWYxZTJjYTQ4NGYyNTMyIiwibmJmIjoxNzE1MzY3NzM3LCJzaWQiOiJzZXNzXzJnSGxkYjZrQUVnemdQUUNPWkNCOWZURVVlSiIsInN1YiI6InVzZXJfMmZ5N2VldGRxTmI1RnQxRWtGamFRaGY2ZFc3In0.CYKIARYSh3tSpRolmlX-d2kGmeHXuznZaGTAgKFuNyr02b19x9L5BmQKzw30dtYgI2ItOt9qXOG3WbUrZH6W_J3QYIUAhMd39_Mapf8DcuNwFE8zzdw5FgcLECePa8v3GXgB4e0BwfHhW4eKU65nYNjqalQ5jNyonH1Krl8rLM0jEXtIr4BN7_wAfAn8bdx8J7vq3Q7GVN9HV-VoFI93r7zuQeH1WTUVOP-43Wsj-shlJl06JeUM-NaTaysOCC42j3qa5XruN6Wh0G5py3H-kHZgnzObyP7Vp7vVQ5GSkkw0QbUiMEp2laOE3Szt69J_EVQR7zeJM1WwDbp-zabiew',
			priority: 'u=1, i',
			'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Linux"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			Referer: 'https://suno.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		},
		body: null,
		method: 'GET',
	},
);

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

const songs: ArrayBuffer[] = [];

async function fetchAudio(urls: string[]): Promise<void> {
	if (urls.length === 0) {
		console.log('All URLs processed');
		return;
	}

	const url = urls[0];
	try {
		const response: AxiosResponse = await axios.get(url, { responseType: 'arraybuffer' });
		songs.push(response.data);
		console.log(`Success for ${url}`);
	} catch (error) {
		console.error(`Error fetching ${url}:`, error);
	}

	// Wait for 2000ms before making the next request
	await delay(2000);

	// Recursive call for the remaining URLs
	await fetchAudio(urls.slice(1));
}

export const generateSong = async (
	gpt_description_prompt: string,
	cookie: string,
	prompt = '',
	make_instrumental = true,
) => {
	const { jwt } = await createSession(cookie);
	const ids = await generate({
		prompt,
		jwt,
		make_instrumental,
		gpt_description_prompt,
	});

	await fetchAudio(ids);

	return songs
};
