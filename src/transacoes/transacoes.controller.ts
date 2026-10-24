import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { Transacao } from './schemas/transacao.schema';
import { TransacoesService } from './transacoes.service';
import type { ConsolidadoResponse } from './transacoes.service';

@Controller('transacoes')
export class TransacoesController {
  constructor(private readonly transacoesService: TransacoesService) {}

  @Post()
  criar(@Body() dto: CreateTransacaoDto): Promise<Transacao> {
    return this.transacoesService.criar(dto);
  }

  @Get()
  listar(): Promise<ConsolidadoResponse> {
    return this.transacoesService.listarConsolidado();
  }
}
