import {
  Message,
  CommandInteraction,
  EmbedBuilder,
  ColorResolvable,
  TextChannel,
} from 'discord.js';
import { logger } from './logger.js';

// Discord has a character limit of 4000 per embed description
const DISCORD_EMBED_DESCRIPTION_LIMIT = 4000;
// Discord has a total message size limit of 6000 characters
const DISCORD_TOTAL_MESSAGE_LIMIT = 6000;

/**
 * Split a long text into chunks that fit within Discord's character limit
 * @param text The text to split
 * @param chunkSize The maximum size of each chunk (default: 4000 characters)
 * @returns An array of text chunks
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = DISCORD_EMBED_DESCRIPTION_LIMIT,
): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    // If the remaining text fits in a chunk, add it and break
    if (remainingText.length <= chunkSize) {
      chunks.push(remainingText);
      break;
    }

    // Find a good breaking point (newline or space) within the chunk size
    let breakPoint = remainingText.lastIndexOf('\n', chunkSize);
    if (breakPoint === -1 || breakPoint < chunkSize / 2) {
      // If no newline found or it's too early in the text, try to break at a space
      breakPoint = remainingText.lastIndexOf(' ', chunkSize);
    }

    // If no good breaking point found, force a break at the chunk size
    if (breakPoint === -1) {
      breakPoint = chunkSize;
    }

    // Add the chunk and update the remaining text
    chunks.push(remainingText.substring(0, breakPoint));
    remainingText = remainingText.substring(breakPoint).trim();
  }

  return chunks;
}

/**
 * Create multiple embeds from a long text
 * @param title The title for the embeds
 * @param text The text to split across embeds
 * @param color The color for the embeds
 * @param footer The footer text for the embeds
 * @returns An array of EmbedBuilder objects
 */
export function createMultipleEmbeds(
  title: string,
  text: string,
  color: string = '#0099ff',
  footer?: { text: string },
): EmbedBuilder[] {
  const chunks = splitTextIntoChunks(text);
  const embeds: EmbedBuilder[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embed = new EmbedBuilder().setColor(color as ColorResolvable).setDescription(chunks[i]);

    // Only add title to the first embed
    if (i === 0) {
      embed.setTitle(title);
    }

    // Only add footer and timestamp to the last embed
    if (i === chunks.length - 1 && footer) {
      embed.setFooter(footer).setTimestamp();
    }

    embeds.push(embed);
  }

  return embeds;
}

/**
 * Estimate the size of an embed in characters
 * @param embed The embed to estimate the size of
 * @returns The estimated size in characters
 */
function estimateEmbedSize(embed: EmbedBuilder): number {
  let size = 0;

  // Add title size if present
  if (embed.data.title) {
    size += embed.data.title.length;
  }

  // Add description size if present
  if (embed.data.description) {
    size += embed.data.description.length;
  }

  // Add footer size if present
  if (embed.data.footer?.text) {
    size += embed.data.footer.text.length;
  }

  // Add some overhead for other embed properties
  size += 100;

  return size;
}

/**
 * Group embeds into batches that fit within Discord's message size limit
 * @param embeds Array of embeds to group
 * @returns Array of embed batches
 */
function groupEmbedsIntoBatches(embeds: EmbedBuilder[]): EmbedBuilder[][] {
  const batches: EmbedBuilder[][] = [];
  let currentBatch: EmbedBuilder[] = [];
  let currentBatchSize = 0;

  for (const embed of embeds) {
    const embedSize = estimateEmbedSize(embed);

    // If adding this embed would exceed the limit, start a new batch
    if (currentBatchSize + embedSize > DISCORD_TOTAL_MESSAGE_LIMIT && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchSize = 0;
    }

    // Add the embed to the current batch
    currentBatch.push(embed);
    currentBatchSize += embedSize;
  }

  // Add the last batch if it's not empty
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

/**
 * Reply to a message or interaction, handling long responses by splitting into multiple embeds
 * @param source Message or CommandInteraction to reply to
 * @param content Content to send or embed options
 * @param dm Whether to send the reply as a DM to the user instead of in the channel
 * @returns The sent message (for Message) or undefined (for CommandInteraction)
 */
export async function safeReply(
  source: Message | CommandInteraction,
  content: string | { embeds: EmbedBuilder[] },
  dm: boolean = false,
): Promise<Message | undefined> {
  try {
    // If content is a string, send it directly (strings are usually short error messages)
    if (typeof content === 'string') {
      if (dm) {
        // Send as DM
        if (source instanceof Message) {
          return await source.author.send(content);
        } else {
          await source.user.send(content);
          if (source.deferred || source.replied) {
            await source.editReply('Summary sent as a DM.');
          } else {
            await source.reply('Summary sent as a DM.');
          }
        }
      } else {
        // Reply in channel
        if (source instanceof Message) {
          return await source.reply(content);
        } else if (source.deferred || source.replied) {
          await source.editReply(content);
        } else {
          await source.reply(content);
        }
      }
      return undefined;
    }

    // If content contains embeds, check if they need to be split
    const { embeds } = content;

    // If there are no embeds, send as is
    if (embeds.length === 0) {
      if (dm) {
        // Send as DM
        if (source instanceof Message) {
          return await source.author.send(content);
        } else {
          await source.user.send(content);
          if (source.deferred || source.replied) {
            await source.editReply('Summary sent as a DM.');
          } else {
            await source.reply('Summary sent as a DM.');
          }
        }
      } else {
        // Reply in channel
        if (source instanceof Message) {
          return await source.reply(content);
        } else if (source.deferred || source.replied) {
          await source.editReply(content);
        } else {
          await source.reply(content);
        }
      }
      return undefined;
    }

    // Check if the first embed has no description
    if (!embeds[0].data.description) {
      // Group embeds into batches that fit within Discord's message size limit
      const embedBatches = groupEmbedsIntoBatches(embeds);

      // If all embeds fit in a single batch, send as is
      if (embedBatches.length === 1) {
        if (dm) {
          // Send as DM
          if (source instanceof Message) {
            return await source.author.send(content);
          } else {
            await source.user.send(content);
            if (source.deferred || source.replied) {
              await source.editReply('Summary sent as a DM.');
            } else {
              await source.reply('Summary sent as a DM.');
            }
          }
        } else {
          // Reply in channel
          if (source instanceof Message) {
            return await source.reply(content);
          } else if (source.deferred || source.replied) {
            await source.editReply(content);
          } else {
            await source.reply(content);
          }
        }
        return undefined;
      }

      // Otherwise, send each batch as a separate message
      let firstReply: Message | undefined;

      if (dm) {
        // Send as DM
        const user = source instanceof Message ? source.author : source.user;

        // Send first batch as DM
        firstReply = await user.send({
          embeds: embedBatches[0],
        });

        // Send confirmation in the channel if it's an interaction
        if (!(source instanceof Message)) {
          if (source.deferred || source.replied) {
            await source.editReply('Summary sent as a DM.');
          } else {
            await source.reply('Summary sent as a DM.');
          }
        }
      } else {
        // Send the first batch as a reply
        if (source instanceof Message) {
          firstReply = await source.reply({
            embeds: embedBatches[0],
          });
        } else if (source.deferred || source.replied) {
          await source.editReply({
            embeds: embedBatches[0],
          });
        } else {
          await source.reply({
            embeds: embedBatches[0],
          });
        }
      }

      // Send the rest of the batches as follow-up messages
      for (let i = 1; i < embedBatches.length; i++) {
        if (dm) {
          // Send as DM
          const user = source instanceof Message ? source.author : source.user;
          await user.send({
            embeds: embedBatches[i],
          });
        } else {
          // Send in channel
          if (
            source instanceof Message &&
            source.channel &&
            source.channel instanceof TextChannel
          ) {
            await source.channel.send({
              embeds: embedBatches[i],
            });
          } else if ('followUp' in source) {
            await source.followUp({
              embeds: embedBatches[i],
            });
          }
        }
      }

      return firstReply;
    }

    // Check if the first embed's description exceeds the character limit
    const firstEmbed = embeds[0];
    const description = firstEmbed.data.description;

    if (typeof description === 'string' && description.length > DISCORD_EMBED_DESCRIPTION_LIMIT) {
      // Create multiple embeds from the long description
      const multipleEmbeds = createMultipleEmbeds(
        firstEmbed.data.title?.toString() || '',
        description,
        firstEmbed.data.color?.toString() || '#0099ff',
        firstEmbed.data.footer
          ? { text: firstEmbed.data.footer.text?.toString() || '' }
          : undefined,
      );

      // Group embeds into batches that fit within Discord's message size limit
      const embedBatches = groupEmbedsIntoBatches(multipleEmbeds);

      // Send the first batch as a reply
      let firstReply: Message | undefined;

      if (dm) {
        // Send as DM
        const user = source instanceof Message ? source.author : source.user;

        // Send first batch as DM
        firstReply = await user.send({
          embeds: embedBatches[0].length === 1 ? [embedBatches[0][0]] : embedBatches[0],
        });

        // Send confirmation in the channel if it's an interaction
        if (!(source instanceof Message)) {
          if (source.deferred || source.replied) {
            await source.editReply('Summary sent as a DM.');
          } else {
            await source.reply('Summary sent as a DM.');
          }
        }
      } else {
        // Reply in channel
        if (source instanceof Message) {
          firstReply = await source.reply({
            embeds: embedBatches[0].length === 1 ? [embedBatches[0][0]] : embedBatches[0],
          });
        } else if (source.deferred || source.replied) {
          await source.editReply({
            embeds: embedBatches[0].length === 1 ? [embedBatches[0][0]] : embedBatches[0],
          });
        } else {
          await source.reply({
            embeds: embedBatches[0].length === 1 ? [embedBatches[0][0]] : embedBatches[0],
          });
        }
      }

      // Send the rest of the batches as follow-up messages
      if (embedBatches.length > 1) {
        for (let i = 1; i < embedBatches.length; i++) {
          if (dm) {
            // Send as DM
            const user = source instanceof Message ? source.author : source.user;
            await user.send({
              embeds: embedBatches[i],
            });
          } else {
            // Send in channel
            if (
              source instanceof Message &&
              source.channel &&
              source.channel instanceof TextChannel
            ) {
              await source.channel.send({
                embeds: embedBatches[i],
              });
            } else if ('followUp' in source) {
              await source.followUp({
                embeds: embedBatches[i],
              });
            }
          }
        }
      }

      return firstReply;
    } else {
      // If the description is within the limit, check if we need to split the embeds due to total size limit
      // Group embeds into batches that fit within Discord's message size limit
      const embedBatches = groupEmbedsIntoBatches(embeds);

      // If all embeds fit in a single batch, send as is
      if (embedBatches.length === 1) {
        if (dm) {
          // Send as DM
          if (source instanceof Message) {
            return await source.author.send(content);
          } else {
            await source.user.send(content);
            if (source.deferred || source.replied) {
              await source.editReply('Summary sent as a DM.');
            } else {
              await source.reply('Summary sent as a DM.');
            }
          }
        } else {
          // Reply in channel
          if (source instanceof Message) {
            return await source.reply(content);
          } else if (source.deferred || source.replied) {
            await source.editReply(content);
          } else {
            await source.reply(content);
          }
        }
        return undefined;
      }

      // Otherwise, send each batch as a separate message
      let firstReply: Message | undefined;

      if (dm) {
        // Send as DM
        const user = source instanceof Message ? source.author : source.user;

        // Send first batch as DM
        firstReply = await user.send({
          embeds: embedBatches[0],
        });

        // Send confirmation in the channel if it's an interaction
        if (!(source instanceof Message)) {
          if (source.deferred || source.replied) {
            await source.editReply('Summary sent as a DM.');
          } else {
            await source.reply('Summary sent as a DM.');
          }
        }
      } else {
        // Send the first batch as a reply
        if (source instanceof Message) {
          firstReply = await source.reply({
            embeds: embedBatches[0],
          });
        } else if (source.deferred || source.replied) {
          await source.editReply({
            embeds: embedBatches[0],
          });
        } else {
          await source.reply({
            embeds: embedBatches[0],
          });
        }
      }

      // Send the rest of the batches as follow-up messages
      for (let i = 1; i < embedBatches.length; i++) {
        if (dm) {
          // Send as DM
          const user = source instanceof Message ? source.author : source.user;
          await user.send({
            embeds: embedBatches[i],
          });
        } else {
          // Send in channel
          if (
            source instanceof Message &&
            source.channel &&
            source.channel instanceof TextChannel
          ) {
            await source.channel.send({
              embeds: embedBatches[i],
            });
          } else if ('followUp' in source) {
            await source.followUp({
              embeds: embedBatches[i],
            });
          }
        }
      }

      return firstReply;
    }
  } catch (error) {
    logger.error('Error in safeReply:', error);

    // Try to send a simple error message if the original reply failed
    try {
      const errorMessage = `Error sending reply: ${(error as Error).message}`;

      // If dm was requested but failed, try to reply in the channel instead
      if (dm) {
        if (source instanceof Message) {
          return await source.reply(errorMessage);
        } else if (!source.replied) {
          await source.reply(errorMessage);
        }
      } else {
        // Original reply in channel failed
        if (source instanceof Message) {
          return await source.reply(errorMessage);
        } else if (!source.replied) {
          await source.reply(errorMessage);
        }
      }
    } catch (followUpError) {
      logger.error('Failed to send error message:', followUpError);
    }
  }

  return undefined;
}
