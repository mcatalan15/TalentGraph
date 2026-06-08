import { pool } from 'pg'

export async function checkAndInsertStudent(request: any, userData: any): Promise<boolean> {

    if (!userData) {
        request.log.error('No user data provided to checkAndInsertStudent')
        return false
    }

    const pool = request.server.pool

    try {

        const { id, login, email, displayname } = userData
        
        // check if student already exists
        const res = await pool.query('SELECT id FROM students WHERE id = $1', [id])
        
        // if not, insert into database
        if (res.rows.length === 0) {

            const newUser = {
                id: userData.id,
                displayname: userData.displayname,
                login: userData.login,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                usual_full_name: userData.usual_full_name,
                phone: userData.phone === 'hidden' ? null : userData.phone,
                url: userData.url,
                image_url: userData.image_url,
                staff: userData.staff,
                active: userData.active,
                alumni: userData.alumni,
            }

            const res = await pool.query(
                'INSERT INTO students (id, displayname, login, email, first_name, last_name, usual_full_name, phone, url, image_url, staff, active, alumni) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
                [newUser.id, newUser.displayname, newUser.login, newUser.email, newUser.first_name, newUser.last_name, newUser.usual_full_name, newUser.phone, newUser.url, newUser.image_url, newUser.staff, newUser.active, newUser.alumni]
            )

            if (res.ok) {
                request.log.info(`Inserted student with id ${id} into database successfully`)
                return true
            } else {
                request.log.error(`Failed to insert student with id ${id} into database`)
                return false
            }

        } else {

            request.log.info(`Student with id ${id} already exists in database`)

        }
    } catch (err) {

        request.log.error('Error checking/inserting student in database', err)
        throw new Error('Failed to check/insert student in database', { cause: err })

    }
    return true
}
