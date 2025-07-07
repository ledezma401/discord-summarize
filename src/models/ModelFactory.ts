import { ModelInterface } from './ModelInterface';
import { OpenAIModel } from './OpenAIModel';
import { MockModel } from './MockModel';

/**
 * Factory for creating AI model instances
 */
export class ModelFactory {
  private static models: Map<string, new () => ModelInterface> = new Map();

  /**
   * Register a model with the factory
   * @param name Name of the model
   * @param modelClass Constructor for the model
   */
  public static registerModel(name: string, modelClass: new () => ModelInterface): void {
    this.models.set(name.toLowerCase(), modelClass);
  }

  /**
   * Create a model instance
   * @param name Name of the model to create (case-insensitive)
   * @returns Instance of the requested model
   * @throws Error if the model is not registered
   */
  public static createModel(name: string): ModelInterface {
    const modelClass = this.models.get(name.toLowerCase());
    if (!modelClass) {
      throw new Error(`Model "${name}" not registered`);
    }
    return new modelClass();
  }

  /**
   * Get the names of all registered models
   * @returns Array of model names
   */
  public static getAvailableModels(): string[] {
    return Array.from(this.models.keys());
  }
}

// Register the OpenAI model
ModelFactory.registerModel('openai', OpenAIModel);

// Register the Mock model for testing
if (process.env.NODE_ENV === 'test') {
  ModelFactory.registerModel('mock', MockModel);
}
