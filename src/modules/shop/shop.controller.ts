import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ShopService } from './shop.service';
import { CreateShopItemDto } from './dto/create-item.dto';
import { CreateShopOrderDto } from './dto/create-order.dto';

@ApiTags('Shop')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('shop')
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get('items')
  listItems(@Query('visible') visible: string | undefined, @Req() req: any) {
    return this.shop.listItems(visible, req.user);
  }
  @Get('orders')
listOrders(@Query('status') status: string | undefined, @Req() req: any) {
  return this.shop.listOrders(status, req.user);
}


  @Post('items')
  createItem(@Body() dto: CreateShopItemDto, @Req() req: any) {
    return this.shop.createItem(dto, req.user);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: CreateShopItemDto, @Req() req: any) {
    return this.shop.updateItem(id, dto, req.user);
  }

  @Get('orders')
  listOrders(@Query('status') status: string | undefined, @Req() req: any) {
    return this.shop.listOrders(status, req.user);
  }

  @Post('orders')
  createOrder(@Body() dto: CreateShopOrderDto, @Req() req: any) {
    return this.shop.createOrder(dto, req.user);
  }

  @Post('orders/:id/approve')
  approve(@Param('id') id: string, @Req() req: any) {
    return this.shop.approve(id, req.user);
  }

  @Post('orders/:id/reject')
  reject(@Param('id') id: string, @Req() req: any) {
    return this.shop.reject(id, req.user);
  }
}