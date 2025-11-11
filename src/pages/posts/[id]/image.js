import { getChannelInfo } from '../../../lib/telegram/index.js'
import { generatePostImage } from '../../../lib/image-generator.js'

export async function GET({ params, url, ...Astro }) {
  try {
    const postId = params.id

    // Get query parameters
    const mode = url.searchParams.get('mode') || 'vertical'
    const width = Number.parseInt(url.searchParams.get('width') || '800', 10)
    const height = url.searchParams.has('height')
      ? Number.parseInt(url.searchParams.get('height'), 10)
      : null
    const bgColor = url.searchParams.get('bg') || '#ffffff'
    const textColor = url.searchParams.get('color') || '#000000'

    // Fetch post data
    const post = await getChannelInfo(Astro, {
      type: 'post',
      id: postId,
    })

    if (!post) {
      return new Response('Post not found', { status: 404 })
    }

    // Fetch channel info
    const channelInfo = await getChannelInfo(Astro)

    // Generate image
    const imageBuffer = await generatePostImage(post, channelInfo, {
      mode,
      width,
      height,
      backgroundColor: bgColor,
      textColor,
    })

    // Return image with appropriate headers
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="post-${postId}.png"`,
      },
    })
  }
  catch (error) {
    console.error('Error generating image:', error)
    return new Response(`Error generating image: ${error.message}`, {
      status: 500,
    })
  }
}
