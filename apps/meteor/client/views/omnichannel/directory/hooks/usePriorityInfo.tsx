import type { ILivechatPriority, Serialized } from '@rocket.chat/core-typings';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';

export type ILivechatClientPriority = Serialized<ILivechatPriority> & {
	i18n: TranslationKey;
};

export const usePriorityInfo = (priorityId: string) => {
	const getPriority = useEndpoint('GET', `/v1/livechat/priorities/${priorityId}`);
	return useQuery(['/v1/livechat/priorities', priorityId], () => getPriority() as Promise<ILivechatClientPriority>, { cacheTime: 0 });
};
