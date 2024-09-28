import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from './core'

// Export routes for Next App Roulter
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
})
