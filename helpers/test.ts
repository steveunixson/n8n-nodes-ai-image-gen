import {generateImagesLinks} from "./imgen";

const cookie = `18S9cX_1PtgZFX4G7JYUvVDHtcdTpYWWMKo-8Ax3aGLjgcE_MlMpcVf-_9a8EN2VP5c5gh975cJHi6tEFs-gycf5rY1fcnONuBMZMu2CvZbiB5Vs6Rcc97FQRxekQ_ocsuYqBsBG6cqwmnSqTFyKaipfw3S43tSDDPCoKL8Z-rn_ArtzAzdIDa-qSp0jXQubaCZ1J4Di4yqQ9ns8PQ_-qpA`;

const prompt = `Wizards cooking in KFC kitchen, cctv footage`;

generateImagesLinks(prompt, cookie).catch((err) => {
	console.log(err);
}).then((data) => {
	console.log(data);
})
