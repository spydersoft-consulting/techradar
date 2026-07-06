/* eslint @typescript-eslint/no-explicit-any: 0 */
import React from "react";
import reactCSS from "reactcss";
import { ChromePicker, ColorResult } from "react-color";

interface ColorProps {
  id: string;
  color: string | null | undefined;
  className?: string;
  onColorChange: (color: string) => void;
}

export const ColorPicker: React.FunctionComponent<ColorProps> = ({
  id,
  color,
  onColorChange,
  className,
}: ColorProps) => {
  const [displayColorPicker, setDisplayColorPicker] = React.useState<boolean>(false);
  const [colorState, setColorState] = React.useState<string | null | undefined>(color);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (color: ColorResult) => {
    setColorState(color.hex);
    if (onColorChange != null) {
      console.log(color.hex);
      onColorChange(color.hex);
    }
  };

  React.useEffect(() => {
    setColorState(color);
  }, [color]);

  const styles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: `${colorState}`,
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
      },
      popover: {
        position: "absolute" as any,
        zIndex: 2,
      },
      cover: {
        position: "fixed" as any,
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });
  return (
    <div id={id} className={className}>
      <div style={styles.swatch} onClick={handleClick}>
        <div style={styles.color} />
      </div>
      {displayColorPicker ? (
        <div style={styles.popover}>
          <div style={styles.cover} onClick={handleClose} />
          <ChromePicker color={colorState ?? ""} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
};
// class ColorPicker extends React.Component {

//   constructor(props) {
//       super(props);

//       this.state = {
//         displayColorPicker: false,
//         color: props.color
//       };
//   }

//   handleClick = () => {
//     this.setState({ displayColorPicker: !this.state.displayColorPicker })
//   };

//   handleClose = () => {
//     this.setState({ displayColorPicker: false })
//   };

//   handleChange = (color) => {
//     this.setState({ color: color.hex })
//     if (this.props.onColorChange != null) {
//         console.log(color.hex)
//         this.props.onColorChange(color.hex);
//     }
//   };

//   componentWillReceiveProps(nextProps) {
//     this.setState({color: nextProps.color});
//   }

//   render() {

//     const styles = reactCSS({
//       'default': {
//         color: {
//           width: '36px',
//           height: '14px',
//           borderRadius: '2px',
//           background: `${ this.state.color }`,
//         },
//         swatch: {
//           padding: '5px',
//           background: '#fff',
//           borderRadius: '1px',
//           boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
//           display: 'inline-block',
//           cursor: 'pointer',
//         },
//         popover: {
//           position: 'absolute',
//           zIndex: '2',
//         },
//         cover: {
//           position: 'fixed',
//           top: '0px',
//           right: '0px',
//           bottom: '0px',
//           left: '0px',
//         },
//       },
//     });

//     return (
//       <div>
//         <div style={ styles.swatch } onClick={ this.handleClick }>
//           <div style={ styles.color } />
//         </div>
//         { this.state.displayColorPicker ? <div style={ styles.popover }>
//           <div style={ styles.cover } onClick={ this.handleClose }/>
//           <ChromePicker color={ this.state.color } onChange={ this.handleChange } />
//         </div> : null }

//       </div>
//     )
//   }
// }

// export default ColorPicker
