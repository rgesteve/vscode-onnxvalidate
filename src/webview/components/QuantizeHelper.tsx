export class QuantizeInputParams {
    "datasetPath": string;
    "modelPath": string;
    "functionName": string;
    "datasetSize": string;
    "datasetPathPreprocessed" : string
    QuantizeInputParams() {
        this.datasetPath = "";
        this.modelPath = "";
        this.functionName = "";
        this.datasetSize = "";
        this.datasetPathPreprocessed = "";

    }
}


