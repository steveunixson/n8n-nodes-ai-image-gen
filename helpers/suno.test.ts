import { generateSong } from './songgen';

const cookie = ``;

const prompt = `Wizards cooking in KFC kitchen, cctv footage`;

generateSong(prompt, cookie)
	.catch((err) => {
		console.log(err);
	})
	.then((data) => {
		console.log(data);
	});
