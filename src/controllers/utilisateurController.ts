import Utilisateur from '../models/Utilisateur';
import { comparePasswords } from '../utils/hash'

// Login methode pour verifier les identifiants de l'utilisateur en base de donnée
exports.login = function (req : any, res: any) {
    Utilisateur.findOne({nom: req.query.nom}, function (err: any, utilisateur: any) {
        if (err){
            return res.status(500).json({ error: err });
        }
        else if (utilisateur != null){
            // verifier que les mots de passes correspondent
            let matched:boolean = comparePasswords(req.query.mdp, utilisateur.mdp);
            // envoyer la reponse
            if (matched) {
                // si l'utilisateur est trouve et que le mot de passe correspond
                return res.status(200).json({ "message": "L'utilisateur est connecte."});
            }
        }
        // si l'utilisateur n'est pas trouve ou que le mot de passe ne correspond pas
        return res.status(401).json({ "message": "L'utilisateur n'est pas connecte."});
    });
}