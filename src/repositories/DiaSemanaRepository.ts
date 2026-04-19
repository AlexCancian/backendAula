import connectionAgenda from "../dataBase/data";
import DiasSemana from "../entity/DiasSemana";
import IDiaSemana from "../interfaces/IDiaSemana";


const diaSemana = connectionAgenda.getRepository(DiasSemana);

const getDiasSemana = async (): Promise<IDiaSemana[]> => {
  const data = await diaSemana.find();
  return data;
};

// const getDiasSemanaRelation = async (): Promise<IDiaSemana[]> => {
//   const data = await diaSemana.find({relations: {diasHorarios: true}});
//   return data;
// };

const getDiaSemanaById = async (idHorario: number): Promise<any> => {
  const diasSemana = await diaSemana.findOneBy({ idHorario });
  if (!diasSemana) {
    return { status: 404, message: "id não existe" };
  }
  return diasSemana;
};



const postDiaSemana = async (novoDiaSemana: IDiaSemana): Promise<any> => {
  try {
    const exist = await diaSemana.findOne({
      where: { diaSemana: novoDiaSemana.diaSemana },
    });
    if (exist !== null) {
      return {
        status: 409,
        message: `Este dia da semana já existe no banco de dados`,
      };
    }
    const newDia = await diaSemana.create({
      diaSemana: novoDiaSemana.diaSemana,
      horaInicio: novoDiaSemana.horaInicio,
      horaFim: novoDiaSemana.horaFim,
      intervaloSlotMinutos: novoDiaSemana.intervaloSlotMinutos,
      ativo: novoDiaSemana.ativo
    });
    await diaSemana.save(newDia);
    return newDia;
  } catch (error) {
    throw error;
  }
}

const updateDiaSemana = async (id: number, diaSemanaAtualizar: IDiaSemana) => {
  try {
    const altDiaSemana = await diaSemana.update(id, {
      diaSemana: diaSemanaAtualizar.diaSemana,
      horaInicio: diaSemanaAtualizar.horaInicio,
      horaFim: diaSemanaAtualizar.horaFim,
      intervaloSlotMinutos: diaSemanaAtualizar.intervaloSlotMinutos,
      ativo: diaSemanaAtualizar.ativo
    });
    return { status: 202, message: `Horário alterado com sucesso` };
  } catch (error) {
    throw error;
  }
};

const desativaDiaSemana = async (id: number, ativo: boolean) => {
  try {
    const desativarDiaSemana = await diaSemana.update(id, { ativo: ativo });
    return "Dia da Semana atualizado com sucesso";
  } catch (error) {
    throw error;
  }
};


const deleteDiaSemana = async (idHorario: number): Promise<any> => {
  try {
    const HorarioExist = await diaSemana.findOneBy({ idHorario });
    if (!HorarioExist) {
      return { status: 404, message: "id não existe" };
    }
    await diaSemana.delete(idHorario);
    return { status: 200, message: "Horário removido com sucesso" };
  } catch (error) {
    throw error;
  }
};

export {
  getDiasSemana,
  getDiaSemanaById,
  postDiaSemana,
  updateDiaSemana,
  desativaDiaSemana,
  deleteDiaSemana
};
