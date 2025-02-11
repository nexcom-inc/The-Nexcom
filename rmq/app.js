let currentQueue = null;

async function fetchQueues() {
    try {
        const queues = await RabbitMQApi.fetchQueues();
        RabbitMQUI.updateQueueList(queues);
        if (currentQueue) {
            const details = await RabbitMQApi.fetchQueueDetails(currentQueue.vhost, currentQueue.name);
            RabbitMQUI.updateQueueDetails(details);
        }
    } catch (error) {
        RabbitMQUI.showError('Failed to fetch queues. Please try again later.');
    }
}

async function purgeQueue(vhost, name) {
    try {
        await RabbitMQApi.purgeQueue(vhost, name);
        alert('Queue purged successfully!');
        fetchQueues();
    } catch (error) {
        RabbitMQUI.showError('Failed to purge queue.');
    }
}

async function deleteQueue(vhost, name) {
    if (confirm('Are you sure you want to delete this queue?')) {
        try {
            await RabbitMQApi.deleteQueue(vhost, name);
            alert('Queue deleted successfully!');
            currentQueue = null;
            fetchQueues();
        } catch (error) {
            RabbitMQUI.showError('Failed to delete queue.');
        }
    }
}

// Initial fetch and refresh every 5 seconds
$(document).ready(() => {
    fetchQueues();
    setInterval(fetchQueues, 5000);
});
