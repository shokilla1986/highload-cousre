import { Body, Controller, Get, Header, Post, Param } from '@nestjs/common';

import { IsNotEmpty } from 'class-validator';
// import memjs from 'memjs';
import Redis from 'ioredis';

// const memcached = memjs.Client.create();
const redis = new Redis();

export class CreateNewsDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}

const authors = ['Po', 'Ro', 'ChiCho', 'Li'];

let cashe;
@Controller('news')
export class NewsController {
  @Get()
  async getNews() {
    if (!cashe) {
      const news = Object.keys([...Array(20)])
        .map((key) => Number(key) + 1)
        .map((n) => ({
          id: n,
          author: authors[Math.floor(Math.random() * authors.length)],
          title: `Важная новость ${n}`,
          description: ((rand) =>
            [...Array(rand(1000))]
              .map(() =>
                rand(10 ** 16)
                  .toString(36)
                  .substring(rand(10))
              )
              .join(' '))((max) => Math.ceil(Math.random() * max)),
          createdAt: Date.now(),
        }));

      redis.set('key', JSON.stringify(news));
      cashe = await redis.get('key');
      // console.log('test: ', JSON.parse(cashe));

      return news;
    } else {
      console.log('cashe');

      return cashe;
    }
  }

  //пробую добавить добавление в кеш новых новостей
  @Post()
  @Header('Cache-Control', 'none')
  async create(@Body() peaceOfNews: CreateNewsDto) {
    const newNews = {
      id: Math.ceil(Math.random() * 1000),
      ...peaceOfNews,
      author: authors[Math.floor(Math.random() * authors.length)],
      createdAt: Date.now(),
    };

    const casheNews = await redis.get('key');

    const newCashe = JSON.parse(casheNews);

    newCashe.push(newNews);

    redis.set('key', JSON.stringify(newCashe));
    cashe = await redis.get('key');

    return newNews;
  }
  // @Post()
  // @Header('Cache-Control', 'none')
  // create(@Body() peaceOfNews: CreateNewsDto) {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       console.log('Новость успешно создана', peaceOfNews);
  //       const newNews = resolve({
  //         id: Math.ceil(Math.random() * 1000),
  //         ...peaceOfNews,
  //       });
  //     }, 100);
  //   });
  // }

  // @Get('test-memcached/:searchtext')
  // async testMemcached(@Param('searchtext') searchtext: string) {
  //   memcached.set('foo', searchtext, { expires: 600 });

  //   const result = await memcached.get('foo');

  //   return result.value.toString();
  // }

  @Get('test-redis/:searchtext')
  async testRedis(@Param('searchtext') searchtext: string) {
    redis.set('foo', searchtext);

    const result = await redis.get('foo');
    console.log('result', result);

    return result;
  }
  @Get('raiting')
  async raiting() {
    return 'result';
  }
}
