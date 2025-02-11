const API_URL = 'http://localhost:3000/api/rabbitmq';

$(document).ready(function () {
    fetchQueues();
    setInterval(fetchQueues, 5000);
    $('#refresh-queues').click(fetchQueues);
});

function fetchQueues() {
    $.get(`${API_URL}/queues`)
        .done(updateQueueList)
        .fail(() => updateConnectionStatus(false));
}

function updateQueueList(queues) {
    updateConnectionStatus(true);
    const queueList = $('#queueList');
    queueList.empty();

    if (!queues.length) {
        queueList.append('<div class="text-gray-400">No queues found</div>');
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
                    <button onclick="deleteQueue('${queue.vhost}', '${queue.name}')" class="text-red-500">&times;</button>
                </div>
            </div>
        `);
        queueItem.click(() => showQueueDetails(queue));
        queueList.append(queueItem);
    });
}

function showQueueDetails(queue) {
    $.get(`${API_URL}/queues/${encodeURIComponent(queue.vhost)}/${encodeURIComponent(queue.name)}`)
        .done(updateQueueDetails)
        .fail(() => alert('Failed to load queue details'));
}

function updateQueueDetails(details) {
    const detailsContainer = $('#queueDetails');
    detailsContainer.html(`
        <div>
            <h2 class="text-2xl font-bold mb-4">${details.name}</h2>
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-700 p-4 rounded-lg">
                    <p class="text-sm text-gray-400">Messages</p>
                    <p class="text-2xl font-bold">${details.messages}</p>
                </div>
                <div class="bg-gray-700 p-4 rounded-lg">
                    <p class="text-sm text-gray-400">Consumers</p>
                    <p class="text-2xl font-bold">${details.consumers}</p>
                </div>
            </div>
            <div class="mt-4 flex space-x-2">
                <button onclick="purgeQueue('${details.vhost}', '${details.name}')" class="bg-yellow-500 px-4 py-2 rounded">Purge</button>
                <button onclick="deleteQueue('${details.vhost}', '${details.name}')" class="bg-red-500 px-4 py-2 rounded">Delete</button>
            </div>
        </div>
    `);
}

function purgeQueue(vhost, name) {
    $.ajax({
        url: `${API_URL}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}/purge`,
        type: 'DELETE'
    }).done(() => fetchQueues());
}

function deleteQueue(vhost, name) {
    $.ajax({
        url: `${API_URL}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`,
        type: 'DELETE'
    }).done(() => fetchQueues());
}

function updateConnectionStatus(connected) {
    const indicator = $('#connected-indicator');
    const statusText = $('#connection-status');
    if (connected) {
        indicator.removeClass('bg-red-500').addClass('bg-green-500');
        statusText.text('Connected');
    } else {
        indicator.removeClass('bg-green-500').addClass('bg-red-500');
        statusText.text('Not connected');
    }
}
