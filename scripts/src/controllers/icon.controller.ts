import { Controller, Get, Query, Header } from '@nestjs/common';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Avatar from 'boring-avatars';

@Controller('api/icon')
export class IconController {
  @Get()
  @Header('Content-Type', 'image/svg+xml')
    getIcon(@Query('value') value: string = ''): string {
      const svgString = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Avatar, {
          name: value || 'totem',
          colors: ["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"],
          variant: "pixel",
          size: 64,
          square: true,
        })
      );
      return svgString;
    }
}
