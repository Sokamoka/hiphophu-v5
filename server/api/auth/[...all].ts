export default defineEventHandler(event => useServerAuth(event).handler(toWebRequest(event)))
