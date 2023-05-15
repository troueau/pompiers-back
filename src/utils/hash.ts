import bcrypt from "bcrypt";

export function hashPassword(password: string, saltRounds = 8): string {
    try {
      // Generer un salt
      const salt = bcrypt.genSaltSync(saltRounds)

      // Hash le mot de passe
      return bcrypt.hashSync(password, salt)
    } catch (error) {
      console.log(error)
    }

    // Retourne null si erreur
    return null
}

export function comparePasswords(password: string, hash: string): boolean {
    try {
      // Compare les mots de passes
      return bcrypt.compareSync(password, hash)
    } catch (error) {
      console.log(error)
    }

    // Retourne faux si erreur
    return false
}