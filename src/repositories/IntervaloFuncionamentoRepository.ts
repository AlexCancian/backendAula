import connectionAgenda from "../dataBase/data";
import IntervaloFuncionamento from "../entity/IntervaloFuncionamento";
import IIntervaloFuncionamento from "../interfaces/IIntervaloFuncionamento";

const intervaloFuncionamento = connectionAgenda.getRepository(IntervaloFuncionamento);

const getIntervalos = async (): Promise<IntervaloFuncionamento[]> => {
    return await intervaloFuncionamento.find();
};

const getIntervalosByDiaSemana = async (diaSemana: number): Promise<IntervaloFuncionamento[]> => {
    return await intervaloFuncionamento.find({ where: { diaSemana: diaSemana } });
};

const getIntervaloById = async (idIntervalo: number): Promise<any> => {
    const intervalo = await intervaloFuncionamento.findOneBy({ idIntervalo });
    if (!intervalo) {
        return { status: 404, message: "id não existe" };
    }
    return intervalo;
};

const postIntervalo = async (novoIntervalo: IIntervaloFuncionamento): Promise<any> => {
    const novo = intervaloFuncionamento.create({
        diaSemana: novoIntervalo.diaSemana,
        horaInicio: novoIntervalo.horaInicio,
        horaFim: novoIntervalo.horaFim,
        descricao: novoIntervalo.descricao,
        status: novoIntervalo.status,
    });
    await intervaloFuncionamento.save(novo);
    return novo;
};

const updateIntervalo = async (idIntervalo: number, dados: IIntervaloFuncionamento) => {
    try {
        await intervaloFuncionamento.update(idIntervalo, {
            diaSemana: dados.diaSemana,
            horaInicio: dados.horaInicio,
            horaFim: dados.horaFim,
            descricao: dados.descricao,
            status: dados.status,
        });
        return { status: 202, message: "Intervalo alterado com sucesso" };
    } catch (error) {
        throw error;
    }
};

const updateIntervaloStatus = async (idIntervalo: number, status: boolean) => {
    try {
        await intervaloFuncionamento.update(idIntervalo, {
            status: status
        });
        return { status: 202, message: "Status do intervalo alterado com sucesso" };
    } catch (error) {
        throw error;
    }
};

const deleteIntervalo = async (idIntervalo: number): Promise<any> => {
    try {
        const exist = await intervaloFuncionamento.findOneBy({ idIntervalo });
        if (!exist) {
            return { status: 404, message: "id não existe" };
        }
        await intervaloFuncionamento.delete(idIntervalo);
        return { status: 200, message: "Intervalo removido com sucesso" };
    } catch (error) {
        throw error;
    }
};

export {
    getIntervalos,
    getIntervaloById,
    postIntervalo,
    updateIntervalo,
    updateIntervaloStatus,
    deleteIntervalo,
    getIntervalosByDiaSemana
}
