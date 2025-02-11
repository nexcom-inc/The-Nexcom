const NESTJS_API = 'http://localhost:3000/api/rabbitmq';

class RabbitMQApi {
    static async fetchQueues() {
        try {
            const response = await fetch(`${NESTJS_API}/queues`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching queues:', error);
            throw error;
        }
    }

    static async fetchQueueDetails(vhost, name) {
        try {
            const response = await fetch(`${NESTJS_API}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching queue details:', error);
            throw error;
        }
    }

    static async purgeQueue(vhost, name) {
        try {
            const response = await fetch(`${NESTJS_API}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}/purge`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error purging queue:', error);
            throw error;
        }
    }

    static async deleteQueue(vhost, name) {
        try {
            const response = await fetch(`${NESTJS_API}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error deleting queue:', error);
            throw error;
        }
    }
}
