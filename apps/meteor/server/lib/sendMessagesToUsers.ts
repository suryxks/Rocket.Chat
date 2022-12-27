import type { IUser } from '@rocket.chat/core-typings';
import { Users } from '@rocket.chat/models';

import { SystemLogger } from './logger/system';
import { executeSendMessage } from '../../app/lib/server/methods/sendMessage';
import { createDirectMessage } from '../methods/createDirectMessage';

export async function sendMessagesToUsers(fromId = 'rocket.cat', toIds: string[], messageFn: (user: IUser) => string): Promise<string[]> {
	const fromUser = await Users.findOneById(fromId, { projection: { _id: 1 } });
	if (!fromUser) {
		throw new Error(`User not found: ${fromId}`);
	}

	const users = await Users.findByIds(toIds, { projection: { _id: 1, username: 1, language: 1 } }).toArray();
	const success: string[] = [];

	users.forEach((user: IUser) => {
		try {
			const { rid } = createDirectMessage([user.username], fromId);
			const msg = messageFn(user);

			console.log('final message', msg);

			executeSendMessage(fromId, { rid, msg });
			success.push(user._id);
		} catch (error) {
			SystemLogger.error(error);
		}
	});

	return success;
}
