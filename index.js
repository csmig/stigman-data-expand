const Expander = require('./expander.js')

const expander = new Expander()

expand(expander)

async function expand(expander) {
  try {
    await expander.init({
      host: 'localhost',
      port: 50001,
      user: 'stigman',
      password: 'stigman',
      database: 'stigman'
    })
    await expander.expandAssets(7)
    await expander.end()
    console.log('Done')
  }
  catch (e) {
    console.log(e)
  }
}