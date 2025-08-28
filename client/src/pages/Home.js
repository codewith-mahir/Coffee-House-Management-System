export default function Home() {
  return (
    <div style={{ 
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #F5F5DC 50%, #FAEBD7 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ 
          fontSize: '4rem',
          background: 'linear-gradient(135deg, #8B4513, #D2691E, #CD853F)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 'bold',
          marginBottom: '1rem',
          fontFamily: 'serif',
          letterSpacing: '3px'
        }}>
          Welcome to Coffee house
        </h1>
        <p style={{ 
          fontSize: '1.5rem', 
          color: '#5D4037',
          marginBottom: '2rem',
          fontStyle: 'italic',
          lineHeight: '1.6'
        }}>
          Where premium coffee meets exceptional experience
        </p>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#6D4C41',
          marginBottom: '3rem',
          lineHeight: '1.8',
          maxWidth: '600px',
          margin: '0 auto 3rem auto'
        }}>
          Discover our carefully curated selection of artisanal coffees, handcrafted beverages, 
          and gourmet treats in an atmosphere designed for coffee connoisseurs.
        </p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #8B4513, #CD853F)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(139, 69, 19, 0.3)',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 10px 30px rgba(139, 69, 19, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.3)';
          }}
          onClick={() => window.location.href = '/menu'}
          >
            Explore Our Menu
          </button>
          <button style={{
            padding: '1rem 2rem',
            background: 'transparent',
            color: '#8B4513',
            border: '2px solid #8B4513',
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#8B4513';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#8B4513';
            e.target.style.transform = 'translateY(0)';
          }}
          onClick={() => window.location.href = '/register'}
          >
            Join Coffee house
          </button>
        </div>
        
        {/* Features Section */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginTop: '4rem',
          padding: '2rem 0'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '2rem',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(139, 69, 19, 0.1)',
            border: '1px solid rgba(139, 69, 19, 0.1)'
          }}>
            
            <h3 style={{ color: '#8B4513', marginBottom: '1rem', fontWeight: 'bold' }}>Premium Coffee</h3>
            <p style={{ color: '#6D4C41', lineHeight: '1.6' }}>
              Ethically sourced beans from the world's finest coffee regions
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '2rem',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(139, 69, 19, 0.1)',
            border: '1px solid rgba(139, 69, 19, 0.1)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🥐</div>
            <h3 style={{ color: '#8B4513', marginBottom: '1rem', fontWeight: 'bold' }}>Artisan Treats</h3>
            <p style={{ color: '#6D4C41', lineHeight: '1.6' }}>
              Handcrafted pastries and gourmet delights made fresh daily
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '2rem',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(139, 69, 19, 0.1)',
            border: '1px solid rgba(139, 69, 19, 0.1)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
            <h3 style={{ color: '#8B4513', marginBottom: '1rem', fontWeight: 'bold' }}>Premium Experience</h3>
            <p style={{ color: '#6D4C41', lineHeight: '1.6' }}>
              Exceptional service in an atmosphere designed for coffee lovers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
