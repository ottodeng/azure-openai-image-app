import axios from 'axios';

class AzureOpenAIService {
  constructor(config) {
    this.config = config;
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('API Key is required');
    }
    if (!this.config.endpoint) {
      throw new Error('Endpoint is required');
    }
    if (!this.config.deploymentName) {
      throw new Error('Deployment name is required');
    }
  }

  getBaseUrl() {
    return `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}`;
  }

  getHeaders() {
    return {
      'api-key': this.config.apiKey,
      'Content-Type': 'application/json'
    };
  }

  getMultipartHeaders() {
    return {
      'api-key': this.config.apiKey,
      'Content-Type': 'multipart/form-data'
    };
  }

  async generateImages(params) {
    try {
      const url = `${this.getBaseUrl()}/images/generations?api-version=${this.config.apiVersion}`;
      
      const requestBody = {
        prompt: params.prompt,
        model: 'gpt-image-1',
        size: params.size,
        n: params.n,
        quality: params.quality,
        output_format: params.output_format,
        output_compression: params.output_compression,
        stream: params.stream
      };

      // Add optional parameters
      if (params.user) {
        requestBody.user = params.user;
      }

      const response = await axios.post(url, requestBody, {
        headers: this.getHeaders(),
        timeout: 120000 // 2 minutes timeout
      });

      return this.processResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async editImages(params) {
    try {
      const url = `${this.getBaseUrl()}/images/edits?api-version=${this.config.apiVersion}`;
      
      const formData = new FormData();
      
      // Add images
      if (params.images && params.images.length > 0) {
        params.images.forEach((image, index) => {
          formData.append('image[]', image);
        });
      }

      // Add required parameters
      formData.append('prompt', params.prompt);
      formData.append('model', 'gpt-image-1');
      formData.append('size', params.size);
      formData.append('n', params.n.toString());
      formData.append('quality', params.quality);

      // Add optional parameters
      if (params.input_fidelity) {
        formData.append('input_fidelity', params.input_fidelity);
      }
      if (params.mask) {
        formData.append('mask', params.mask);
      }
      if (params.output_format) {
        formData.append('output_format', params.output_format);
      }
      if (params.output_compression) {
        formData.append('output_compression', params.output_compression.toString());
      }
      if (params.stream) {
        formData.append('stream', params.stream.toString());
      }
      if (params.user) {
        formData.append('user', params.user);
      }

      const response = await axios.post(url, formData, {
        headers: this.getMultipartHeaders(),
        timeout: 120000 // 2 minutes timeout
      });

      return this.processResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  processResponse(data) {
    if (data.error) {
      throw new Error(data.error.message || 'API returned an error');
    }

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format');
    }

    return {
      created: data.created,
      images: data.data.map((item, index) => ({
        id: `${data.created}_${index}`,
        b64_json: item.b64_json,
        revised_prompt: item.revised_prompt,
        url: item.b64_json ? `data:image/png;base64,${item.b64_json}` : null
      }))
    };
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      if (data && data.error) {
        if (data.error.code === 'contentFilter') {
          return new Error('Content was filtered by safety system: ' + data.error.message);
        }
        return new Error(`API Error (${status}): ${data.error.message}`);
      }
      
      return new Error(`HTTP Error ${status}: ${error.response.statusText}`);
    } else if (error.request) {
      // Network error
      return new Error('Network error: Unable to reach Azure OpenAI service');
    } else {
      // Other error
      return new Error(error.message || 'Unknown error occurred');
    }
  }
}

export default AzureOpenAIService;

