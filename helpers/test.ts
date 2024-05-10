import {generateImagesLinks} from "./imgen";

const cookie = ``;

const prompt = `Wizards cooking in KFC kitchen, cctv footage`;

generateImagesLinks(prompt, cookie).catch((err) => {
	console.log(err);
}).then((data) => {
	console.log(data);
})
