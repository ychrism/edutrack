async authorize(credentials) {
  console.log('🔍 Authorization attempt:', { username: credentials?.username });
  
  if (!credentials?.username || !credentials?.password) {
    console.log('❌ Missing credentials');
    return null;
  }

  return new Promise((resolve, reject) => {
    console.log('🔍 Querying database for user:', credentials.username);
    
    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [credentials.username, credentials.username],
      async (err, user) => {
        if (err) {
          console.error('❌ Database error:', err);
          reject(err);
          return;
        }

        if (!user) {
          console.log('❌ User not found in database');
          resolve(null);
          return;
        }

        console.log('✅ User found:', { id: user.id, username: user.username, email: user.email });

        try {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔍 Password validation result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            resolve(null);
            return;
          }

          console.log('✅ Authentication successful');
          resolve({
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            name: user.full_name,
            role: user.role,
            image: user.profile_picture
          });
        } catch (bcryptError) {
          console.error('❌ Bcrypt error:', bcryptError);
          resolve(null);
        }
      }
    );
  });
}