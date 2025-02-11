class RabbitMQUI {
  static updateQueueList(queues) {
      const queueList = $('#queueList');
      queueList.empty();

      if (queues.length === 0) {
          queueList.html('<div class="text-gray-400">No queues found</div>');
          return;
      }

      queues.forEach(queue => {
          const queueItem = $(`
              <div class="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                  <div class="flex justify-between items-center">
                      <div>
                          <h3 class="font-medium">${queue.name}</h3>
                          <p class="text-sm text-gray-400">${queue.vhost}</p>
                      </div>
                      <span class="px-2 py-1 text-xs bg-${queue.state === 'running' ? 'green' : 'red'}-500/20 text-${queue.state === 'running' ? 'green' : 'red'}-500 rounded-full">
                          ${queue.state}
                      </span>
                  </div>
              </div>
          `);

          queueItem.click(() => this.showQueueDetails(queue)); // Utilisez `this` pour accéder à la méthode statique
          queueList.append(queueItem);
      });
  }

  static async showQueueDetails(queue) {
      try {
          const details = await RabbitMQApi.fetchQueueDetails(queue.vhost, queue.name);
          this.updateQueueDetails(details);
      } catch (error) {
          this.showError('Failed to fetch queue details. Please try again.');
      }
  }

  static updateQueueDetails(details) {
      const detailsContainer = $('#queueDetails');
      detailsContainer.html(`
          <div>
              <h2 class="text-2xl font-bold mb-4">${details.name}</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-gray-700 p-4 rounded-lg">
                      <p class="text-sm text-gray-400">Messages Ready</p>
                      <p class="text-2xl font-bold">${details.messages_ready}</p>
                  </div>
                  <div class="bg-gray-700 p-4 rounded-lg">
                      <p class="text-sm text-gray-400">Messages Total</p>
                      <p class="text-2xl font-bold">${details.messages}</p>
                  </div>
                  <div class="bg-gray-700 p-4 rounded-lg">
                      <p class="text-sm text-gray-400">Consumers</p>
                      <p class="text-2xl font-bold">${details.consumers}</p>
                  </div>
                  <div class="bg-gray-700 p-4 rounded-lg">
                      <p class="text-sm text-gray-400">State</p>
                      <p class="text-2xl font-bold text-${details.state === 'running' ? 'green' : 'red'}-500">
                          ${details.state}
                      </p>
                  </div>
              </div>

              <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-gray-700 p-4 rounded-lg">
                      <h3 class="font-medium mb-2">Message Rates</h3>
                      <p class="text-sm">Publish: ${details.message_stats?.publish_details?.rate || 0}/s</p>
                      <p class="text-sm">Deliver: ${details.message_stats?.deliver_get_details?.rate || 0}/s</p>
                  </div>
                  <div class="bg-gray-700 p-4 rounded-lg">
                      <h3 class="font-medium mb-2">Memory</h3>
                      <p class="text-sm">Used: ${(details.memory / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
              </div>

              <div class="mt-6 flex space-x-4">
                  <button onclick="purgeQueue('${details.vhost}', '${details.name}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                      Purge Queue
                  </button>
                  <button onclick="deleteQueue('${details.vhost}', '${details.name}')" class="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg">
                      Delete Queue
                  </button>
              </div>
          </div>
      `);
  }

  static showError(message) {
      const errorContainer = $(`
          <div class="bg-red-500/20 text-red-500 p-4 rounded-lg">
              ${message}
          </div>
      `);
      $('#queueDetails').html(errorContainer);
  }
}
