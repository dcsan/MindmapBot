import { createCanvas, Canvas } from "canvas";

export class MindMapNode {
    constructor(public x: number, public y: number, public text: string, public backgroundColor?: string) { }
}

export class Header {
    constructor(public text: string) { }
}

export interface ConfigNode {
    x: number;
    y: number;
    text: string;
    color: string;
}

export interface Config {
    header: string;
    centralNode: {
        x: number;
        y: number;
        text: string;
    };
    nodes: ConfigNode[];
};

export class MindMap {
    private centralNode: MindMapNode | null = null;
    private nodes: MindMapNode[] = [];
    private header: Header | null = null;


    public addCentralNode(centralNode: MindMapNode) {
        this.centralNode = centralNode;
    }

    public addNode(node: MindMapNode) {
        this.nodes.push(node);
    }

    public setHeader(header: Header) {
        this.header = header;
    }

    public setConfig(config: Config) {
        this.centralNode = null;
        this.nodes = [];
        this.header = null;

        this.addCentralNode(
            new MindMapNode(
                config.centralNode.x,
                config.centralNode.y,
                config.centralNode.text,
                "white"
            )
        );

        for (const nodeConfig of config.nodes) {
            this.addNode(
                new MindMapNode(
                    nodeConfig.x,
                    nodeConfig.y,
                    nodeConfig.text,
                    nodeConfig.color
                )
            );
        }

        this.setHeader(new Header(config.header));

    };

    public translateJsonToMindMap(jsonData: object | string): Config {
        let data;

        if (typeof jsonData === "object") data = jsonData;
        else data = JSON.parse(jsonData);

        const centralNodeText = data.name;
        const centralNode: ConfigNode = {
            x: 0,
            y: 0,
            text: centralNodeText,
            color: 'white'
        };

        const nodesData = Object.values(data.nodes);
        const nodes: ConfigNode[] = nodesData.map((nodeData: any) => ({
            x: 0,
            y: 0,
            text: nodeData.nodetext,
            color: nodeData.nodecolor
        }));

        const config: Config = {
            header: centralNodeText,
            centralNode: centralNode,
            nodes: nodes
        };

        return config;
    }

    public generateImage(): Buffer {
        const numNodes = this.nodes.length;
        const radius = 200 + (Math.ceil(numNodes / 12) - 1) * 100;
        const canvasWidth = 2 * (radius + 100);
        const canvasHeight = 2 * (radius + 100);

        const canvas: Canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#403f3b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.centralNode) {
            const centerX = this.centralNode.x = (canvasWidth / 2);
            const centerY = this.centralNode.y = (canvasHeight / 2);

            ctx.font = '18px sans-serif';
            ctx.fillStyle = 'black';
            const text = this.centralNode.text;
            const textWidth = ctx.measureText(text).width;
            const maxTextWidth = 2 * 60 - 10; 
        
            const numNodes = this.nodes.length;
            let radius = 200;

            if (numNodes >= 12) {
                const numSets = Math.ceil(numNodes / 12);
                const angleSpacing = (Math.PI * 2) / numSets;

                for (let set = 0; set < numSets; set++) {
                    const nodesInSet = Math.min(12, numNodes - set * 12);
                    const setRadius = radius + (set * 110);

                    const angleOffset = set === 0 ? 0 : (Math.PI / nodesInSet);

                    for (let i = 0; i < nodesInSet; i++) {
                        const angle = (angleSpacing * set) + (angleOffset) + (Math.PI * 2 * i) / nodesInSet;

                        const nodeX = centerX + setRadius * Math.cos(angle);
                        const nodeY = centerY + setRadius * Math.sin(angle);

                        this.nodes[set * 12 + i].x = nodeX;
                        this.nodes[set * 12 + i].y = nodeY;
                    }
                }
            } else {
                for (let i = 0; i < numNodes; i++) {
                    const angle = (Math.PI * 2 * i) / numNodes;
                    const nodeX = centerX + radius * Math.cos(angle);
                    const nodeY = centerY + radius * Math.sin(angle);

                    this.nodes[i].x = nodeX;
                    this.nodes[i].y = nodeY;
                }
            }

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;

            this.nodes.forEach((node, index) => {

                if (index <= 24) {
                    ctx.beginPath();
                    ctx.moveTo(
                        this.centralNode!.x + (60 * Math.cos(Math.atan2(node.y - centerY, node.x - centerX))),
                        this.centralNode!.y + (60 * Math.sin(Math.atan2(node.y - centerY, node.x - centerX)))
                    );
                    ctx.lineTo(
                        node.x - (50 * Math.cos(Math.atan2(node.y - centerY, node.x - centerX))),
                        node.y - (50 * Math.sin(Math.atan2(node.y - centerY, node.x - centerX)))
                    );
                    ctx.stroke();
                    ctx.closePath();
                };

                ctx.fillStyle = node.backgroundColor ?? 'white';
                ctx.beginPath();
                ctx.arc(node.x, node.y, 60, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });

            ctx.beginPath();
            ctx.arc(this.centralNode.x, this.centralNode.y, 60, 0, Math.PI * 2);
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            ctx.font = '18px sans-serif';
            ctx.fillStyle = 'black';
            if (textWidth > maxTextWidth) {
                const maxWidth = maxTextWidth;
                const lineHeight = 20;
                const lines = [];
                let line = '';
                for (let word of text.split(' ')) {
                    const testLine = line.length > 0 ? line + ' ' + word : word;
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);
        
                const maxLines = Math.floor(maxTextWidth / lineHeight);
                if (lines.length > maxLines) {
                    lines.length = maxLines;
                    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -3) + '...';
                }
        
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const textWidth = ctx.measureText(line).width;
                    const textX = centerX - textWidth / 2;
                    const textY = centerY - 10 + i * lineHeight;
                    ctx.fillText(line, textX, textY);
                }
            } else {
                const textX = centerX - textWidth / 2;
                const textY = centerY + 8;
                ctx.fillText(text, textX, textY);
            }
        }

        if (this.header) {
            ctx.font = '24px sans-serif';
            ctx.fillStyle = 'black';
            ctx.fillText(this.header.text, 10, 30);
        }

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;

        this.nodes.forEach((node) => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 60, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();

            ctx.font = '16px sans-serif';
            ctx.fillStyle = 'black';
            const text = node.text;
            const textWidth = ctx.measureText(text).width;

            if (textWidth > 2 * 60 - 10) {
                const maxWidth = 2 * 60 - 10;
                const lineHeight = 20;
                const lines = [];
                let line = '';
                for (let word of text.split(' ')) {
                    const testLine = line.length > 0 ? line + ' ' + word : word;
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                const maxLines = Math.floor((2 * 60 - 10) / lineHeight);
                if (lines.length > maxLines) {
                    lines.length = maxLines;
                    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -3) + '...';
                }

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const textWidth = ctx.measureText(line).width;
                    const textX = node.x - textWidth / 2;
                    const textY = node.y - 10 + i * lineHeight;
                    ctx.fillText(line, textX, textY);
                }
            } else {
                const textX = node.x - textWidth / 2;
                const textY = node.y + 8;
                ctx.fillText(text, textX, textY);
            }
        });

        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'white';
        const generatedText = 'Generated with mindmap-bot';
        const generatedTextWidth = ctx.measureText(generatedText).width;
        ctx.fillText(
            generatedText,
            canvas.width - generatedTextWidth - 10,
            canvas.height - 10
        );

        return canvas.toBuffer();
    };

    getDistance(node1: any, node2: any) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    isPowerOf12(num: number): any {
        if (num === 1) {
            return true;
        }
        if (num < 1 || num % 12 !== 0) {
            return false;
        }
        return this.isPowerOf12(num / 12);
    };
};