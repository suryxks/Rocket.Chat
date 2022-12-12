import type { Document } from 'mongodb';
import polka from 'polka';

import { api } from '../../../../apps/meteor/server/sdk/api';
import { broker } from '../../../../apps/meteor/ee/server/startup/broker';
import { Collections, getCollection, getConnection } from '../../../../apps/meteor/ee/server/services/mongo';
import { registerServiceModels } from '../../../../apps/meteor/ee/server/lib/registerServiceModels';
import { Logger } from '../../../../apps/meteor/server/lib/logger/Logger';

const PORT = process.env.PORT || 3035;

(async () => {
	const db = await getConnection();

	const trash = await getCollection<Document>(Collections.Trash);

	registerServiceModels(db, trash);

	api.setBroker(broker);

	// need to import service after models are registered
	const { StreamHub } = await import('./StreamHub');
	const { watcher } = await import('../../../../apps/meteor/server/database/DatabaseWatcher');

	watcher.setDb(db);
	api.registerService(new StreamHub(watcher, Logger));

	await api.start();

	polka()
		.get('/health', async function (_req, res) {
			try {
				await api.nodeList();

				if (watcher.isLastDocDelayed()) {
					throw new Error('not healthy');
				}
			} catch (err) {
				console.error('Service not healthy', err);

				res.writeHead(500);
				res.end('not healthy');
				return;
			}

			res.end('ok');
		})
		.listen(PORT);
})();
