// ce module contient les fonctions dont on va avoir besoin un peu partout

const utilsModule = {

    hideModals: () => {
      //on cible TOUTES les modales, 
      var allModals = document.querySelectorAll('.modal');
      // et enlever la classe css "is-active" sur CHACUNE des modales
      for (var modal of allModals){
        modal.classList.remove('is-active');
      }
  
      /** Version alternative avec forEach */
      // allModals.forEach( (modal) => {
      //   modal.classList.remove('is-active');
      // });
    },
  
    //Function to convert hex format to a rgb color
    rgb2hex: (rgb) => {
      rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
      return (rgb && rgb.length === 4) ? "#" +
      ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }
  
  };
  
  module.exports = utilsModule;