import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, Model } from 'mongoose';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { Transacao, TransacaoDocument } from './schemas/transacao.schema';

export interface TransacaoView {
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string;
  consumoConsciente: boolean;
}

export interface ConsolidadoResponse {
  historico: TransacaoView[];
  metricas: {
    saldoTotal: number;
    totalDespesas: number;
    totalGastoImpulso: number;
  };
}

@Injectable()
export class TransacoesService {
  constructor(
    @InjectModel(Transacao.name)
    private readonly transacaoModel: Model<TransacaoDocument>,
  ) {}

  async criar(dto: CreateTransacaoDto): Promise<Transacao> {
    try {
      const nova = new this.transacaoModel(dto);
      return await nova.save();
    } catch (e) {
      // Dados inválidos (ex.: tipo fora de "receita"/"despesa") são erro do cliente: 400, não 500
      if (e instanceof MongooseError.ValidationError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  async listarConsolidado(): Promise<ConsolidadoResponse> {
    const transacoes = await this.transacaoModel
      .find()
      .sort({ _id: -1 })
      .exec();

    let saldoTotal = 0;
    let totalDespesas = 0;
    let totalGastoImpulso = 0;

    const historico: TransacaoView[] = transacoes.map((t) => {
      if (t.tipo === 'receita') {
        saldoTotal += t.valor;
      } else {
        saldoTotal -= t.valor;
        totalDespesas += t.valor;
        if (!t.consumoConsciente) {
          totalGastoImpulso += t.valor;
        }
      }
      return {
        descricao: t.descricao,
        valor: t.valor,
        tipo: t.tipo,
        categoria: t.categoria,
        consumoConsciente: t.consumoConsciente,
      };
    });

    return {
      historico,
      metricas: {
        saldoTotal,
        totalDespesas,
        totalGastoImpulso,
      },
    };
  }
}
