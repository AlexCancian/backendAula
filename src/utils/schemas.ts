import Joi from "joi";

// Empresa Schemas
export const empresaSchema = Joi.object({
  nome: Joi.string().required().messages({
    "string.base": 'O campo "nome" deve ser um texto.',
    "any.required": 'O campo "nome" é obrigatório.',
    "string.empty": 'O campo "nome" não pode estar vazio.',
  }),
  cnpj: Joi.string().length(14).required().messages({
    "string.base": 'O campo "cnpj" deve ser um texto.',
    "string.length":
      'O campo "cnpj" deve ter exatamente 14 caracteres (apenas números).',
    "any.required": 'O campo "cnpj" é obrigatório.',
    "string.empty": 'O campo "cnpj" não pode estar vazio.',
  }),
  telefone: Joi.string().length(11).required().messages({
    "string.base": 'O campo "telefone" deve ser um texto.',
    "string.length":
      'O campo "telefone" deve ter exatamente 11 caracteres (DDD + número).',
    "any.required": 'O campo "telefone" é obrigatório.',
    "string.empty": 'O campo "telefone" não pode estar vazio.',
  }),
  idEndereco: Joi.number().required().messages({
    "number.base": 'O campo "idEndereco" deve ser um número.',
    "any.required": 'O campo "idEndereco" é obrigatório.',
  }),
}).unknown(true);

export const updateEmpresaSchema = Joi.object({
  nome: Joi.string().messages({
    "string.base": 'O campo "nome" deve ser um texto.',
    "string.empty": 'O campo "nome" não pode estar vazio.',
  }),
  cnpj: Joi.string().length(14).messages({
    "string.base": 'O campo "cnpj" deve ser um texto.',
    "string.length": 'O campo "cnpj" deve ter exatamente 14 caracteres.',
    "string.empty": 'O campo "cnpj" não pode estar vazio.',
  }),
  telefone: Joi.string().length(11).messages({
    "string.base": 'O campo "telefone" deve ser um texto.',
    "string.length": 'O campo "telefone" deve ter exatamente 11 caracteres.',
    "string.empty": 'O campo "telefone" não pode estar vazio.',
  }),
  idEndereco: Joi.number().messages({
    "number.base": 'O campo "idEndereco" deve ser um número.',
  }),
})
  .min(1)
  .messages({
    "object.min": "Você deve fornecer pelo menos um campo para atualização.",
  });

// User Schemas
export const userSchema = Joi.object({
  nome: Joi.string().required().messages({
    "string.base": 'O campo "nome" deve ser um texto.',
    "any.required": 'O campo "nome" é obrigatório.',
    "string.empty": 'O campo "nome" não pode estar vazio.',
  }),
  apelido: Joi.string().required().messages({
    "string.base": 'O campo "apelido" deve ser um texto.',
    "any.required": 'O campo "apelido" é obrigatório.',
    "string.empty": 'O campo "apelido" não pode estar vazio.',
  }),
  cpf: Joi.string().length(11).allow(null, "").messages({
    "string.base": 'O campo "cpf" deve ser um texto.',
    "string.length": 'O campo "cpf" deve ter exatamente 11 caracteres.',
  }),
  status: Joi.boolean().messages({
    "boolean.base": 'O campo "status" deve ser verdadeiro ou falso.',
  }),
  email: Joi.string().email().allow(null, "").messages({
    "string.base": 'O campo "email" deve ser um texto.',
    "string.email": "Por favor, insira um endereço de e-mail válido.",
  }),
  senha: Joi.string().allow(null, "").messages({
    "string.base": 'O campo "senha" deve ser um texto.',
  }),
  codigoRecuperacao: Joi.string().allow(null, "").messages({
    "string.base": 'O campo "codigoRecuperacao" deve ser um texto.',
  }),
});

export const updateUserSchema = userSchema
  .fork(Object.keys(userSchema.describe().keys), (schema) => schema.optional())
  .min(1)
  .messages({
    "object.min":
      "Você deve fornecer pelo menos um campo para atualizar o usuário.",
  });

export const updateSenhaSchema = Joi.object({
  senha: Joi.string().required().messages({
    "string.base": 'A "senha" antiga deve ser um texto.',
    "any.required": 'A "senha" antiga é obrigatória.',
    "string.empty": 'A "senha" antiga não pode estar vazia.',
  }),
  novaSenha: Joi.string().required().messages({
    "string.base": 'A "novaSenha" deve ser um texto.',
    "any.required": 'A "novaSenha" é obrigatória para a troca.',
    "string.empty": 'A "novaSenha" não pode estar vazia.',
  }),
});

export const updateAdminStatusSchema = Joi.object({
  Admin: Joi.boolean().required().messages({
    "boolean.base": 'O campo "Admin" deve ser verdadeiro ou falso.',
    "any.required": 'O status de "Admin" é obrigatório.',
  }),
});

export const updateUserStatusSchema = Joi.object({
  status: Joi.boolean().required().messages({
    "boolean.base": 'O campo "status" deve ser verdadeiro ou falso.',
    "any.required": 'O "status" do usuário é obrigatório.',
  }),
});

// Servico Schemas
export const servicoSchema = Joi.object({
  nomeServico: Joi.string().required().messages({
    "string.base": 'O "nomeServico" deve ser um texto.',
    "any.required": 'O "nomeServico" é obrigatório.',
    "string.empty": 'O "nomeServico" não pode estar vazio.',
  }),
  descricaoServico: Joi.string().allow(null, "").messages({
    "string.base": 'A "descricaoServico" deve ser um texto.',
  }),
  tempoServico: Joi.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.base":
        'O "tempoServico" deve ser um texto no formato HH:MM ou HH:MM:SS.',
      "string.pattern.base":
        'O "tempoServico" deve estar no formato de hora válido (HH:MM ou HH:MM:SS).',
      "any.required": 'O "tempoServico" é obrigatório.',
    }),
  valor: Joi.number().precision(2).required().messages({
    "number.base": 'O "valor" deve ser um número.',
    "number.precision": 'O "valor" deve ter no máximo 2 casas decimais.',
    "any.required": 'O "valor" do serviço é obrigatório.',
  }),
  statusServico: Joi.boolean().messages({
    "boolean.base": 'O "statusServico" deve ser verdadeiro ou falso.',
  }),
  EmpresaId: Joi.number().allow(null, "").messages({
    "number.base": 'O "EmpresaId" deve ser um número.',
  }),
});

export const updateServicoSchema = servicoSchema
  .fork(Object.keys(servicoSchema.describe().keys), (schema) =>
    schema.optional(),
  )
  .min(1)
  .messages({
    "object.min":
      "Você deve enviar pelo menos um campo para atualizar o serviço.",
  });

export const updateServicoStatusSchema = Joi.object({
  statusServico: Joi.boolean().required().messages({
    "boolean.base": 'O "statusServico" deve ser verdadeiro ou falso.',
    "any.required": 'O "statusServico" é obrigatório para atualização.',
  }),
});

// Agenda Schemas
export const agendaSchema = Joi.object({
  dataAgenda: Joi.date().required().messages({
    "date.base": 'A "dataAgenda" deve ser uma data válida.',
    "any.required": 'A "dataAgenda" é obrigatória.',
  }),
  horaInicialAgenda: Joi.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.base": 'A "horaInicialAgenda" deve ser um texto.',
      "string.pattern.base":
        'A "horaInicialAgenda" deve estar no formato HH:MM ou HH:MM:SS.',
      "any.required": 'A "horaInicialAgenda" é obrigatória.',
    }),
  horaFinal: Joi.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.base": 'A "horaFinal" deve ser um texto.',
      "string.pattern.base":
        'A "horaFinal" deve estar no formato HH:MM ou HH:MM:SS.',
      "any.required": 'A "horaFinal" é obrigatória.',
    }),
  pagamento: Joi.boolean().messages({
    "boolean.base": 'O campo "pagamento" deve ser verdadeiro ou falso.',
  }),
  idServico: Joi.number().required().messages({
    "number.base": 'O "idServico" deve ser um número válido.',
    "any.required": 'O "idServico" é obrigatório.',
  }),
  usuarioId: Joi.number().required().messages({
    "number.base": 'O "usuarioId" deve ser um número válido.',
    "any.required": 'O "usuarioId" é obrigatório.',
  }),
  status: Joi.string().messages({
    "string.base": 'O "status" deve ser um texto.',
  }),
  motivoCancelamento: Joi.string().allow(null, "").messages({
    "string.base": 'O "motivoCancelamento" deve ser um texto.',
  }),
  dataCancelamento: Joi.date().allow(null, "").messages({
    "date.base": 'A "dataCancelamento" deve ser uma data válida.',
  }),
});

export const updateAgendaSchema = agendaSchema
  .fork(Object.keys(agendaSchema.describe().keys), (schema) =>
    schema.optional(),
  )
  .min(1)
  .messages({
    "object.min":
      "Pelo menos um campo deve ser fornecido para atualizar a agenda.",
  });

export const updateAgendaStatusSchema = Joi.object({
  status: Joi.string().required().messages({
    "string.base": 'O "status" deve ser um texto.',
    "any.required": 'O "status" é obrigatório para atualização.',
    "string.empty": 'O "status" não pode ser vazio.',
  }),
  motivoCancelamento: Joi.string().allow(null, "").messages({
    "string.base": 'O "motivoCancelamento" deve ser um texto.',
  }),
});

// CaixaDia Schemas
export const caixaDiaSchema = Joi.object({
  dataPagamento: Joi.date().required().messages({
    "date.base": 'A "dataPagamento" deve ser uma data válida.',
    "any.required": 'A "dataPagamento" é obrigatória.',
  }),
  valor: Joi.number().precision(2).required().messages({
    "number.base": 'O "valor" deve ser um número.',
    "number.precision": 'O "valor" deve ter no máximo 2 casas decimais.',
    "any.required": 'O "valor" é obrigatório.',
  }),
  idFormasPag: Joi.number().required().messages({
    "number.base": 'O "idFormasPag" deve ser um número.',
    "any.required": 'O "idFormasPag" é obrigatório.',
  }),
  idAgenda: Joi.number().allow(null).messages({
    "number.base": 'O "idAgenda" deve ser um número.',
  }),
  origem: Joi.string().valid('AGENDA', 'MANUAL').required().messages({
    "string.base": 'A "origem" deve ser um texto.',
    "any.only": 'A "origem" deve ser "AGENDA" ou "MANUAL".',
    "any.required": 'A "origem" é obrigatória.',
  }),
  descricao: Joi.string().allow(null, "").messages({
    "string.base": 'A "descricao" deve ser um texto.',
  }),
});

export const updateCaixaDiaSchema = caixaDiaSchema
  .fork(Object.keys(caixaDiaSchema.describe().keys), (schema) =>
    schema.optional(),
  )
  .min(1)
  .messages({
    "object.min":
      "Você deve fornecer pelo menos um campo para atualizar o registro de caixa.",
  });

// AgenteDeIA Schemas
export const agenteDeIAPostSchema = Joi.object({
  descricao: Joi.string().required().messages({
    "string.base": 'A "descricao" deve ser um texto.',
    "any.required": 'A "descricao" é obrigatória.',
    "string.empty": 'A "descricao" não pode estar vazia.',
  }),
  redeSocial: Joi.string().required().messages({
    "string.base": 'A "redeSocial" deve ser um texto.',
    "any.required": 'A "redeSocial" é obrigatória.',
    "string.empty": 'A "redeSocial" não pode estar vazia.',
  }),
  // imagemUrl is handled by multer
}).unknown(true);

// Agendar Schemas
export const gerarLinkSchema = Joi.object({
  usuarioId: Joi.number().required().messages({
    "number.base": 'O "usuarioId" deve ser um número.',
    "any.required": 'O "usuarioId" é obrigatório.',
  }),
});

export const agendaClienteSchema = Joi.object({
  dataAgenda: Joi.date().required().messages({
    "date.base": 'A "dataAgenda" deve ser uma data válida.',
    "any.required": 'A "dataAgenda" é obrigatória.',
  }),
  horaInicialAgenda: Joi.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.base": 'A "horaInicialAgenda" deve ser um texto.',
      "string.pattern.base":
        'A "horaInicialAgenda" deve estar no formato HH:MM ou HH:MM:SS.',
      "any.required": 'A "horaInicialAgenda" é obrigatória.',
    }),
  horaFinal: Joi.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.base": 'A "horaFinal" deve ser um texto.',
      "string.pattern.base":
        'A "horaFinal" deve estar no formato HH:MM ou HH:MM:SS.',
      "any.required": 'A "horaFinal" é obrigatória.',
    }),
  pagamento: Joi.boolean().messages({
    "boolean.base": 'O campo "pagamento" deve ser verdadeiro ou falso.',
  }),
  idServico: Joi.number().required().messages({
    "number.base": 'O "idServico" deve ser um número válido.',
    "any.required": 'O "idServico" é obrigatório.',
  }),
  usuarioId: Joi.number().optional().messages({
    "number.base": 'O "usuarioId" deve ser um número válido.',
  }),
  motivoCancelamento: Joi.string().allow(null, "").messages({
    "string.base": 'O "motivoCancelamento" deve ser um texto.',
  }),
}).unknown(true);

export const revogarLinkSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.base": 'O "id" deve ser um texto.',
    "any.required": 'O "id" é obrigatório.',
    "string.empty": 'O "id" não pode estar vazio.',
  }),
});

export const mensagemSchema = Joi.object({
  usuarioId: Joi.number().required().messages({
    "number.base": 'O "usuarioId" deve ser um número.',
    "any.required": 'O "usuarioId" é obrigatório.',
  }),
  link: Joi.string().uri().required().messages({
    "string.base": 'O "link" deve ser um texto.',
    "string.uri": 'O "link" deve ser uma URL válida.',
    "any.required": 'O "link" é obrigatório.',
    "string.empty": 'O "link" não pode estar vazio.',
  }),
});

export const getLinksQuerySchema = Joi.object({
  usuarioId: Joi.number().required().messages({
    "number.base": 'O "usuarioId" deve ser um número.',
    "any.required": 'O "usuarioId" é obrigatório.',
  }),
}).unknown(true);

export const validarLinkQuerySchema = Joi.object({
  token: Joi.string().required().messages({
    "string.base": 'O "token" deve ser um texto.',
    "any.required": 'O "token" é obrigatório.',
    "string.empty": 'O "token" não pode estar vazio.',
  }),
}).unknown(true);

export const agendasLivresQuerySchema = Joi.object({
  data: Joi.string().required().messages({
    "string.base": 'A "data" deve ser um texto.',
    "any.required": 'A "data" é obrigatória.',
  }),
  idServico: Joi.number().required().messages({
    "number.base": 'O "idServico" deve ser um número.',
    "any.required": 'O "idServico" é obrigatório.',
  }),
}).unknown(true);

// CategoriaDespesa Schemas
export const categoriaDespesaSchema = Joi.object({
  nome: Joi.string().required().messages({
    "string.base": 'O campo "nome" deve ser um texto.',
    "any.required": 'O campo "nome" é obrigatório.',
    "string.empty": 'O campo "nome" não pode estar vazio.',
  }),
  cor: Joi.string().allow(null, "").messages({
    "string.base": 'O campo "cor" deve ser um texto.',
  }),
  ativo: Joi.boolean().required().messages({
    "boolean.base": 'O campo "ativo" deve ser verdadeiro ou falso.',
    "any.required": 'O campo "ativo" é obrigatório.',
  }),
});

export const updateCategoriaDespesaSchema = categoriaDespesaSchema
  .fork(Object.keys(categoriaDespesaSchema.describe().keys), (schema) =>
    schema.optional()
  )
  .min(1)
  .messages({
    "object.min":
      "Você deve fornecer pelo menos um campo para atualizar a categoria de despesa.",
  });

export const updateStatusCategoriaDespesaSchema = Joi.object({
  ativo: Joi.boolean().required().messages({
    "boolean.base": 'O campo "ativo" deve ser verdadeiro ou falso.',
    "any.required": 'O campo "ativo" é obrigatório.',
  }),
});

// DespesaFixa Schemas
export const despesaFixaSchema = Joi.object({
  descricao: Joi.string().required().messages({
    "string.base": 'O campo "descricao" deve ser um texto.',
    "any.required": 'O campo "descricao" é obrigatório.',
    "string.empty": 'O campo "descricao" não pode estar vazio.',
  }),
  valor: Joi.number().precision(2).required().messages({
    "number.base": 'O campo "valor" deve ser um número.',
    "number.precision": 'O campo "valor" deve ter no máximo 2 casas decimais.',
    "any.required": 'O campo "valor" é obrigatório.',
  }),
  diaVencimento: Joi.number().integer().min(1).max(31).required().messages({
    "number.base": 'O campo "diaVencimento" deve ser um número.',
    "number.integer": 'O campo "diaVencimento" deve ser um número inteiro.',
    "number.min": 'O campo "diaVencimento" deve ser no mínimo 1.',
    "number.max": 'O campo "diaVencimento" deve ser no máximo 31.',
    "any.required": 'O campo "diaVencimento" é obrigatório.',
  }),
  idCategoriaDespesa: Joi.number().required().messages({
    "number.base": 'O campo "idCategoriaDespesa" deve ser um número.',
    "any.required": 'O campo "idCategoriaDespesa" é obrigatório.',
  }),
  ativo: Joi.boolean().messages({
    "boolean.base": 'O campo "ativo" deve ser verdadeiro ou falso.',
  }),
});

export const updateDespesaFixaSchema = despesaFixaSchema
  .fork(Object.keys(despesaFixaSchema.describe().keys), (schema) =>
    schema.optional()
  )
  .min(1)
  .messages({
    "object.min":
      "Você deve fornecer pelo menos um campo para atualizar a despesa fixa.",
  });

export const updateStatusDespesaFixaSchema = Joi.object({
  ativo: Joi.boolean().required().messages({
    "boolean.base": 'O campo "ativo" deve ser verdadeiro ou falso.',
    "any.required": 'O campo "ativo" é obrigatório.',
  }),
});

// Financeiro Schemas
export const financeiroSchema = Joi.object({
  descricao: Joi.string().required().messages({
    "string.base": 'O campo "descricao" deve ser um texto.',
    "any.required": 'O campo "descricao" é obrigatório.',
    "string.empty": 'O campo "descricao" não pode estar vazio.',
  }),
  valor: Joi.number().precision(2).required().messages({
    "number.base": 'O campo "valor" deve ser um número.',
    "number.precision": 'O campo "valor" deve ter no máximo 2 casas decimais.',
    "any.required": 'O campo "valor" é obrigatório.',
  }),
  dataDespesa: Joi.date().required().messages({
    "date.base": 'O campo "dataDespesa" deve ser uma data válida.',
    "any.required": 'O campo "dataDespesa" é obrigatório.',
  }),
  tipo: Joi.string().valid('FIXA', 'VARIAVEL').required().messages({
    "string.base": 'O campo "tipo" deve ser um texto.',
    "any.only": 'O campo "tipo" deve ser "FIXA" ou "VARIAVEL".',
    "any.required": 'O campo "tipo" é obrigatório.',
  }),
  idDespesaFixa: Joi.number().allow(null).messages({
    "number.base": 'O campo "idDespesaFixa" deve ser um número.',
  }),
  pago: Joi.boolean().required().messages({
    "boolean.base": 'O campo "pago" deve ser verdadeiro ou falso.',
    "any.required": 'O campo "pago" é obrigatório.',
  }),
  idCategoriaDespesa: Joi.number().allow(null).messages({
    "number.base": 'O campo "idCategoriaDespesa" deve ser um número.',
  }),
});

export const updateFinanceiroSchema = financeiroSchema
  .fork(Object.keys(financeiroSchema.describe().keys), (schema) =>
    schema.optional()
  )
  .min(1)
  .messages({
    "object.min":
      "Você deve fornecer pelo menos um campo para atualizar o registro financeiro.",
  });

export const updateStatusFinanceiroSchema = Joi.object({
  pago: Joi.boolean().required().messages({
    "boolean.base": 'O campo "pago" deve ser verdadeiro ou falso.',
    "any.required": 'O campo "pago" é obrigatório.',
  }),
});
