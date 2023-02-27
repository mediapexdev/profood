import React from 'react';

class TypeBoxCard extends React.Component {
	render() {
		return (
			<div className="type-box card shadow-sm mx-auto" tabIndex="0">
				<div className="card-body">
					<div className="content-box">
						<h3 className="title card-title title-color font-md">{this.props.typeBox.wording}</h3>
						{/* <p className="content-color font-sm">Get instant delivery</p> */}
						<p className="content-color font-sm">{this.props.typeBox.slice_number} découpes</p>
						<a href="#" tabIndex="0" role="button">Achetez</a>
					</div>
				</div>
			</div>
		);
  	}
}

export default TypeBoxCard;
