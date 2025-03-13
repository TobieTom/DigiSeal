import { create } from 'ipfs-http-client';

class IPFSService {
    constructor() {
        // Connect to public IPFS gateway (for production, use your own IPFS node)
        this.ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
    }

    async addJSON(jsonData) {
        try {
            const { path } = await this.ipfs.add(JSON.stringify(jsonData));
            return path;
        } catch (error) {
            console.error("Error adding to IPFS:", error);
            throw error;
        }
    }

    async getJSON(cid) {
        try {
            const stream = this.ipfs.cat(cid);
            let data = '';

            for await (const chunk of stream) {
                data += new TextDecoder().decode(chunk);
            }

            return JSON.parse(data);
        } catch (error) {
            console.error("Error getting from IPFS:", error);
            throw error;
        }
    }

    async addFile(file) {
        try {
            const added = await this.ipfs.add(file);
            return added.path;
        } catch (error) {
            console.error("Error adding file to IPFS:", error);
            throw error;
        }
    }
}

const ipfsService = new IPFSService();
export default ipfsService;