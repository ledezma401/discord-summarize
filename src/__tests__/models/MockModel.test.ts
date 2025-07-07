import { MockModel } from '../../models/MockModel.js';

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

  it('should summarize messages with formatted output', async () => {
    const model = new MockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages, true);
    expect(summary).toContain('# 📝 Summary');
    expect(summary).toContain('**Main Topics:**');
    expect(summary).toContain('## 👥 Perspectives');
  });

  it('should handle timeout errors', async () => {
    const model = new MockModel();
    await expect(model.summarize(['Message 1'], false, 0)).rejects.toThrow('Timeout error');
  });
});
