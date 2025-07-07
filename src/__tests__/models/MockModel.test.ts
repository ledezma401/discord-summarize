import { MockModel } from '../../models/MockModel';

describe('MockModel', () => {
  it('should create an instance', () => {
    const model = new MockModel();
    expect(model).toBeInstanceOf(MockModel);
  });

  it('should return the correct name', () => {
    const model = new MockModel();
    expect(model.getName()).toBe('MockModel');
  });

  it('should summarize messages', async () => {
    const model = new MockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages);
    expect(summary).toBe('Summarized 3 messages');
  });
});