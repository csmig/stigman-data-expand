const mysql = require('mysql2/promise')
const crypto = require('crypto')

class Expander {

  async init(connectionOptions) {
    this.connection = await mysql.createConnection(connectionOptions)
  }
  async end() {
    await this.connection.end()
  }
  async expandAssets(iterations = 1) {
    const bigComment = crypto.randomBytes(500000).toString('hex')
    const sqlAssets = `
insert into asset(
  assetId,
  name,
  fqdn,
  collectionId,
  ip,
  mac,
  description,
  noncomputing,
  metadata)
select
  assetId + 1000,
  concat(name,"_A")  as name,
    fqdn,
    collectionId,
    ip,
    mac,
    description,
    noncomputing,
    metadata
from
  asset
where
  -- increment by 1000
  assetId > (? * 1000)
order by
  assetId
    `
    const sqlStigAssets = `
    insert into stig_asset_map(
      assetId,
      benchmarkId)
    select
      -- increment by 1000
      assetId + (1000 * (?+1)),
      benchmarkId
    from
      stig_asset_map
    where
      assetId < 1000
    `
    const sqlReviewComments = `
    UPDATE review SET detail = ? WHERE RAND() < 0.05
    `
    const sqlReviews = `
    insert into review(
      reviewId,
      assetId,
      ruleId,
      resultId,
      detail,
      comment,
      autoResult,
      ts,
      userId,
      statusId,
      statusText,
      statusUserId,
      statusTs,
      metadata)
    select
      reviewId + (200000 * (?+1)),
      assetId + (1000 * (?+1)),
      ruleId,
      resultId,
      detail,
      comment,
      autoResult,
      ts,
      userId,
      statusId,
      statusText,
      statusUserId,
      statusTs,
      metadata
    from
      review
    where
      reviewId < 200000;
    `
    const sqlReviewHistory = `
    insert into review_history(
      reviewId,
      resultId,
      detail,
      comment,
      autoResult,
      ts,
      userId,
      statusId,
      statusText,
      statusUserId,
      statusTs,
      touchTs
    )
    select
      reviewId,
      resultId,
      detail,
      comment,
      autoResult,
      ts,
      userId,
      statusId,
      statusText,
      statusUserId,
      statusTs,
      touchTs + ?
    from
      review
    `
    // await this.connection.query(`ALTER TABLE review DISABLE KEYS`)
    // await this.connection.query(`SET FOREIGN_KEY_CHECKS = 0`)
    // await this.connection.query(`SET UNIQUE_CHECKS = 0`)

    console.log(`enlarge random review comments`)
    await this.connection.query(sqlReviewComments, [bigComment])

    // for (let iteration = 0; iteration < iterations; iteration++) {
    //   console.log(`\niteration: ${iteration}`)
      
    //   console.log(`assets`)
    //   await this.connection.query(sqlAssets, [iteration])
      
    //   console.log(`stig_asset_map`)
    //   await this.connection.query(sqlStigAssets, [iteration])
      
    //   console.log(`review`)
    //   let hrstart = process.hrtime()
    //   await this.connection.query(sqlReviews, [iteration, iteration])
    //   let hrend = process.hrtime(hrstart)
    //   console.log(`in ${hrend[0]}s  ${hrend[1] / 1000000}ms`)

    //   console.log(`review_history`)
    //   hrstart = process.hrtime()
    //   await this.connection.query(sqlReviewHistory, [iteration])
    //   hrend = process.hrtime(hrstart)
    //   console.log(`in ${hrend[0]}s  ${hrend[1] / 1000000}ms`)

    // }
    // await this.connection.query(`ALTER TABLE review ENABLE KEYS`)
    // await this.connection.query(`SET UNIQUE_CHECKS = 1`)
    // await this.connection.query(`SET FOREIGN_KEY_CHECKS = 1`)
  }
}

module.exports = Expander