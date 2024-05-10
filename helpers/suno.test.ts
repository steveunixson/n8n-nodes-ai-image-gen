import { generateSong } from './songgen';

const cookie = `_cfuvid=GhbFhpq5oVp_4mV0eLO3TXtTRyK0oqQ0IbmBSV5fZCQ-1715361438265-0.0.1.1-604800000; __cf_bm=ZW8853eBy66qo_Fcz194gnwfnJlUfS.MdEvANZCqDcY-1715362304-1.0.1.1-c3zz9T57IFt0m4Kkpn00tNOzQBw787eX7nwvvw3WVwfskQqjqNNp.PGCuuC3yUtVSXfQ4mtud7_1uhzRXsdp5w; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%2C%22%24device_id%22%3A%20%2218f4434c4f93dd-0161225fc23a7c-13462c6f-1fa400-18f4434c4f93dd%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsuno.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22suno.com%22%2C%22%24user_id%22%3A%20%224cfd7d32-5780-40ff-a320-6db43867f46d%22%7D; __client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZ0hsYnRNQ1RnQ3lBOUFxR3ZORTUxc2Y2d2YiLCJyb3RhdGluZ190b2tlbiI6Im5iNXpuOWpsNzVhdTZsY3ZmNXNhb3h5YzB6eGFyMDR5MnNmYnF5c2kifQ.tPWd4Wz3W0cnXuWXPbZ2mUr8WXm31nvHWiV8osLioDVo800eU3ttuT9IGfM-h1rUgPXPn7015Yp_5HljCRZ_Vua-kaSbHRNUW66OTL1qmtIdgeS6ayqiZEZJ95giBTRdaapQoCb5TU_xwbH1qG4KW8ntR6tmB-vHsrnFp6LKRLWOYVLWL1UB__KN_mvWBfPuxRjPvstz5JIjzDoAKZV12ULx30Sw1PYimznFWUCpJp1Y3Q8xlmx-g3VGq3rbJJwgnaVfCkzcaxd_Q_tGjwGfjzIWAWnUfRI93YmxANbNlmAajbrDz354P5PH4IDbOkiTaEQP0XVWqSxLixoRLgYfHg; __client_uat=1715362471; __cf_bm=p2ZZN_ztzqY3qqiZ2HiZqV8Srazzi1j5GB6tJhPQs4k-1715362472-1.0.1.1-rRbQBFwPz7kDhBzLAT54ProDLKYO6ofabit4OAMl1Pa82abm8Rn05DzOAC6fZ9mJADHYZFUcVYW9FQJLawMEFA`;

const prompt = `Wizards cooking in KFC kitchen, cctv footage`;

generateSong(prompt, cookie)
	.catch((err) => {
		console.log(err);
	})
	.then((data) => {
		console.log(data);
	});
