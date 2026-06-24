
export async function checkAndInsertStudent(request: any, userData: any): Promise<boolean> {

    if (!userData) {
        request.log.error('No user data provided to checkAndInsertStudent')
        return false
    }

    const pool = request.server.pool

    try {

        const { id } = userData
        
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
                usual_first_name: userData.usual_first_name,
                phone: userData.phone === 'hidden' ? null : userData.phone,
                url: userData.url,
                image_url: userData.image.link,
                staff: userData['staff?'] ?? false,
                active: userData['active?'] ?? false,
                alumni: userData['alumni?'] ?? false,
            }

            const res = await pool.query(
                'INSERT INTO students (id, displayname, login, email, first_name, last_name, usual_full_name, usual_first_name, phone, url, image_url, staff, active, alumni) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                [newUser.id, newUser.displayname, newUser.login, newUser.email, newUser.first_name, newUser.last_name, newUser.usual_full_name, newUser.usual_first_name, newUser.phone, newUser.url, newUser.image_url, newUser.staff, newUser.active, newUser.alumni]
            )

            if (res) {
                return true
            } else {
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
