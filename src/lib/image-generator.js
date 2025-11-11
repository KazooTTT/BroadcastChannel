import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'
import satori from 'satori'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Strip HTML tags for plain text rendering
function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
}

// Load font once at module level
let fontData
function loadFont() {
  if (!fontData) {
    try {
      const fontPath = join(__dirname, '../../public/fonts/noto-sans.ttf')
      fontData = readFileSync(fontPath)
    }
    catch (error) {
      console.error('Failed to load font:', error)
      throw new Error('Font file not found. Please ensure noto-sans.ttf exists in public/fonts/')
    }
  }
  return fontData
}

/**
 * Generate an image from post data
 * @param {object} post - Post data
 * @param {object} channelInfo - Channel information
 * @param {object} options - Generation options
 * @returns {Promise<Buffer>} Image buffer
 */
export async function generatePostImage(post, channelInfo, options = {}) {
  const {
    width = 800,
    height = null, // Auto height if not specified
    backgroundColor = '#ffffff',
    textColor = '#000000',
  } = options

  const plainText = stripHtml(post.content || post.text || '')
  const title = channelInfo?.title || 'BroadcastChannel'
  const postDate = new Date(post.datetime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Load font data
  const font = loadFont()

  // Create SVG markup using React-like JSX syntax for satori
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor,
          color: textColor,
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
        },
        children: [
          // Header with channel info
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
                borderBottom: `2px solid ${textColor}20`,
                paddingBottom: '20px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '28px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                          },
                          children: title,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '16px',
                            color: `${textColor}80`,
                          },
                          children: postDate,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          // Post content
          {
            type: 'div',
            props: {
              style: {
                fontSize: '20px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                flex: 1,
              },
              children: plainText.slice(0, 1000) + (plainText.length > 1000 ? '...' : ''),
            },
          },
          // Tags if present
          ...(post.tags && post.tags.length > 0
            ? [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginTop: '30px',
                    },
                    children: post.tags.map(tag => ({
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: `${textColor}10`,
                          color: textColor,
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                        },
                        children: `#${tag}`,
                      },
                    })),
                  },
                },
              ]
            : []),
        ],
      },
    },
    {
      width,
      height: height || 600, // Default height if not specified
      fonts: [
        {
          name: 'Inter',
          data: font,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  )

  // Convert SVG to PNG using sharp
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  return pngBuffer
}

/**
 * Generate layout-specific images
 * @param {Array} posts - Array of posts
 * @param {object} channelInfo - Channel information
 * @param {string} mode - Layout mode (vertical, two-column, compact)
 * @returns {Promise<Buffer>} Image buffer
 */
export async function generateMultiPostImage(posts, channelInfo, mode = 'vertical') {
  // For now, just generate the first post
  // This can be extended to support multiple posts in different layouts
  if (posts && posts.length > 0) {
    return generatePostImage(posts[0], channelInfo, { mode })
  }
  throw new Error('No posts to generate image from')
}
