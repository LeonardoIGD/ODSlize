import { motion } from 'framer-motion';
import './GameHeader.css';

const HomeIcon = ({ size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className="home-icon"
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const GameHeader = ({ 
  title, 
  code, 
  logoUrl, 
  isVisible = true 
}) => {
  if (!isVisible || !title) return null;

  return (
    <div className="ods-header" style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        animate={{ 
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 opacity-20 -z-10"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(43, 139, 129, 0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(226, 143, 57, 0.15), transparent 50%)",
          backgroundSize: "200% 200%",
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1
        }}
      />

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ y: -2, boxShadow: '0 14px 30px rgba(0, 0, 0, 0.12)' }}
        className="ods-header-content"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '2px solid rgba(43, 139, 129, 0.2)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {logoUrl && (
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.03, rotate: 2 }}
            className="ods-logo"
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(43, 139, 129, 0.3)',
              border: '2px solid rgba(43, 139, 129, 0.3)'
            }}>
              <img 
                src={logoUrl} 
                alt={`Logo ${code}`}
                className="ods-logo-image"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </motion.div>
        )}
        
        <motion.div 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="ods-info"
        >
          {code && (
            <motion.span 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="ods-code"
              style={{ 
                color: '#2B8B81', 
                fontWeight: 900,
                fontSize: '16px',
                letterSpacing: '0.5px'
              }}
            >
              {code}
            </motion.span>
          )}
          <motion.h2 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="ods-title"
            style={{ 
              color: '#2B8B81', 
              fontWeight: 700,
              marginTop: '4px',
              fontSize: '18px'
            }}
          >
            {title}
          </motion.h2>
        </motion.div>

        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8, type: "spring", bounce: 0.3 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 8px 25px rgba(202, 25, 66, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
          className="home-button"
          onClick={() => {
            // eslint-disable-next-line no-restricted-globals
            location.assign('/');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#CA1942',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(202, 25, 66, 0.2)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
        >
          <HomeIcon size={18} />
          <span>Voltar</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default GameHeader;
