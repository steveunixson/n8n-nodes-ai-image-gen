import { IExecuteFunctions } from 'n8n-workflow';

import { INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { generateImagesLinks } from '../../helpers/imgen';

//import { IDataObject } from 'n8n-workflow';

//import { OptionsWithUri } from 'request';

export class ImageGen implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'ImageGen',
		name: 'imageGen',
		icon: 'file:friendGrid.svg',
		group: ['transform'],
		version: 1,
		description: 'Generate images using BING',
		defaults: {
			name: 'ImageGen',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// Resources and operations will go here
			{
				displayName: 'Cookie',
				name: 'cookie',
				type: 'string',
				required: true,
				default: '',
				placeholder: '',
				description: 'Insert an authorization cookie from Bing',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Wizards cooking in KFC kitchen, cctv footage',
				description: 'Prompt for AI model',
			},
		],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Map data to n8n data structure
		const cookie = this.getNodeParameter('cookie', 0) as string;
		const prompt = this.getNodeParameter('prompt', 0) as string;
		const imageLinks = await generateImagesLinks(prompt, cookie);

		return [this.helpers.returnJsonArray({ links: imageLinks })];
	}
}
