import { Body, Controller, Get, Header, Post, Param } from '@nestjs/common';

import { IsNotEmpty } from 'class-validator';
// import memjs from 'memjs';
import Redis from 'ioredis';

// const memcached = memjs.Client.create();
const redis = new Redis();
// redis.on('error', (err) => console.log('Redis Client Error', err));

export class CreateNewsDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}

let cashe;
@Controller('news')
export class NewsController {
  @Get()
  async getNews() {
    // await redis.connect();
    if (!cashe) {
      const news = Object.keys([...Array(20)])
        .map((key) => Number(key) + 1)
        .map((n) => ({
          id: n,
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
      // await news.forEach((oneNews) => {
      //   console.log('set');

      //   redis.set('key', JSON.stringify(oneNews));
      // });
      redis.set('key', JSON.stringify(news));
      cashe = await redis.get('key');
      console.log('test: ', cashe);

      return news;
    } else {
      return cashe;
    }
  }

  // @Get()
  // async getNews() {
  //   if (!cashe) {
  //     const result = new Promise((resolve) => {
  //       const news = Object.keys([...Array(20)])
  //         .map((key) => Number(key) + 1)
  //         .map((n) => ({
  //           id: n,
  //           title: `Важная новость ${n}`,
  //           description: ((rand) =>
  //             [...Array(rand(1000))]
  //               .map(() =>
  //                 rand(10 ** 16)
  //                   .toString(36)
  //                   .substring(rand(10))
  //               )
  //               .join(' '))((max) => Math.ceil(Math.random() * max)),
  //           createdAt: Date.now(),
  //         }));

  //       resolve(news);
  //       // setTimeout(() => {
  //       //   resolve(news);
  //       // }, 100);
  //     });
  //     await redis.set('cashe', result);

  //     // cashe = await redis.get('cashe');

  //     cashe = await new Promise((resolve, rejects) => {
  //       resolve(redis.get('cashe'));
  //       // resolve(result);
  //     });

  //     // cashe.then((result) => {
  //     //   console.log('result: ', result);
  //     // });
  //     console.log('cashe: ', cashe);
  //     return result;
  //   } else {
  //     console.log('hohohoho');

  //     return cashe;
  //   }
  // const result = new Promise((resolve) => {
  //   const news = Object.keys([...Array(20)])
  //     .map((key) => Number(key) + 1)
  //     .map((n) => ({
  //       id: n,
  //       title: `Важная новость ${n}`,
  //       description: ((rand) =>
  //         [...Array(rand(1000))]
  //           .map(() =>
  //             rand(10 ** 16)
  //               .toString(36)
  //               .substring(rand(10))
  //           )
  //           .join(' '))((max) => Math.ceil(Math.random() * max)),
  //       createdAt: Date.now(),
  //     }));

  //   resolve(news);
  //   // setTimeout(() => {
  //   //   resolve(news);
  //   // }, 100);
  // });
  // return result;
  // }
  @Post()
  @Header('Cache-Control', 'none')
  create(@Body() peaceOfNews: CreateNewsDto) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Новость успешно создана', peaceOfNews);
        const newNews = resolve({
          id: Math.ceil(Math.random() * 1000),
          ...peaceOfNews,
        });
        console.log('newNews: ', newNews);

        redis.set('cashe', newNews);
      }, 100);
    });
  }

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
}
