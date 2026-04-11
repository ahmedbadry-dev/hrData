import axios from 'axios'
import * as cheerio from 'cheerio'

export class EwdifahDetailScraper {
  private readonly headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }

  async fetchBodyText(jobUrl: string): Promise<string> {
    const { data: html } = await axios.get(jobUrl, {
      headers: this.headers,
      timeout: 20_000,
    })

    const $ = cheerio.load(html)

    $('.card-body').find('ins.adsbygoogle, script, iframe').remove()

    const bodyText = $('.card-body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()

    if (!bodyText) {
      return $('meta[name="description"]').attr('content') || ''
    }

    return bodyText
  }
}