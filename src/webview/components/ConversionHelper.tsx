export class ConversionInputParams {
    "inputNode": string;
    "outputNode": string;
    "opset": string;
    "modelPath": string;
    

    ConversionInputParams() {
      this.inputNode = "";
      this.outputNode = "";
      this.opset = "";
      this.modelPath = "";
     
    }
  }