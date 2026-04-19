import connectionAgenda from "../dataBase/data";
import Audit from "../entity/Audit";



interface IAudit {
    descricao: string;
    entidade?: string;
    entityId?: number;
    dados?: any;
}

const postAudit = async (data: IAudit): Promise<Audit> => {
    const auditRepo = connectionAgenda.getRepository(Audit);
    const auditEntry = auditRepo.create({
        descricao: data.descricao,
        entidade: data.entidade || undefined,
        entityId: data.entityId || undefined,
        dados: data.dados ? JSON.stringify(data.dados) : undefined,
    });
    return await auditRepo.save(auditEntry);
};

export { postAudit };
