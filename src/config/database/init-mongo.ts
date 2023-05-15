import Utilisateur from '../../models/Utilisateur';
import { hashPassword } from '../../utils/hash';

async function ajoutComptesDefaut() {
    for (let i = 0; i < 3; i++) {
        var nomEtMdp = "test"+i;
        const utilisateurExiste = await Utilisateur.exists({nom: nomEtMdp});
        if (!utilisateurExiste) {
            Utilisateur.create({
                nom: nomEtMdp,
                mdp: hashPassword(nomEtMdp)
            });
            console.log('Compte ' + nomEtMdp + ' créé.');
        }
    }
}

module.exports = {ajoutComptesDefaut};