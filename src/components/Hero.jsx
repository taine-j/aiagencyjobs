import { FiArrowRight } from 'react-icons/fi';
import AIAnimation from './AIAnimation';
import GridBackground from './GridBackground'; // Add this import

const Hero = ({
  title = 'Become a A.I Agency Dev',
  subtitle = 'Find the A.I Agency job that fits your skill set',
}) => {
  return (
    <section className='bg-blue-900 h-[65vh] flex items-center relative overflow-hidden'>
      <GridBackground /> {/* Add this line */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
          <div>
            <h1 className='text-5xl font-bold text-white mb-6 leading-tight animate-fade-in-up'>
              {title}
            </h1>
            <p className='text-xl text-blue-200 mb-8'>{subtitle}</p>
            <button
              onClick={() => window.location.href = '/jobs'}
              className='bg-white text-blue-900 font-semibold py-3 px-6 rounded-full hover:bg-blue-100 transition duration-300 flex items-center'
            >
              Get Started
              <FiArrowRight className='ml-2' />
            </button>
          </div>
        </div>
      </div>
      <div className='absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-blue-800 to-transparent'></div>
      <div className='absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-blue-800 to-transparent'></div>
      <div className='absolute top-1/2 right-0 transform -translate-y-1/2 w-1/2 h-2/3 z-20'> {/* Added z-20 */}
        <AIAnimation />
      </div>
    </section>
  );
};

export default Hero;
