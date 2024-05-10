import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { generateSong } from '../../helpers/songgen';

export class SunoAI implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'SunoAI',
		name: 'sunoAI',
		icon: 'file:friendGrid.svg',
		group: ['transform'],
		version: 1,
		description: 'Generate songs using Suno',
		defaults: {
			name: 'SunoAI',
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
				description: 'Insert an authorization cookie from SunoAI',
			},
			{
				displayName: 'GPT Description Prompt',
				name: 'gpt_description_prompt',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Wizards cooking in KFC kitchen, drum and base',
				description: 'Description Prompt for AI model',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				default: '',
				placeholder: '',
				description: 'Prompt for song generator AI model',
			},
			{
				displayName: 'Make Instrumental',
				name: 'make_instrumental',
				type: 'boolean',
				default: true,
				placeholder: '',
				description: 'Whether a song needs lyrics?',
			}
		],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Map data to n8n data structure
		const cookie = this.getNodeParameter('cookie', 0) as string;
		const gpt_description_prompt = this.getNodeParameter('gpt_description_prompt', 0) as string;
		const prompt = this.getNodeParameter('gpt_description_prompt', 0) as string;
		const make_instrumental = this.getNodeParameter('make_instrumental', 0) as boolean;

		const songBuffers = await generateSong(
			gpt_description_prompt,
			cookie,
			prompt,
			make_instrumental,
		);

		return [this.helpers.returnJsonArray({ songs: songBuffers })];
	}
}
