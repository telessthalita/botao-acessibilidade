<?php
/**
 * Plugin Name:       Botão de Acessibilidade
 * Description:       Botão lateral com tamanho do texto, leitura em voz alta, alto contraste, tons de cinza, links destacados, fonte legível, espaçamento, parar animações, cursor grande, guia de leitura e Libras (VLibras).
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Thalita Teles
 * License:           MIT
 * Text Domain:       botao-acessibilidade
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // acesso direto ao arquivo: não faz nada
}

const BA11Y_VERSAO = '1.0.0';
const BA11Y_OPCAO  = 'botao_acessibilidade';

/** Configurações salvas, com valores padrão. */
function ba11y_config() {
	$padrao = array(
		'cor'    => '#1449c7',
		'lado'   => 'direita',
		'libras' => 'sim',
	);
	$salvo = get_option( BA11Y_OPCAO, array() );
	return wp_parse_args( is_array( $salvo ) ? $salvo : array(), $padrao );
}

/** Carrega o botão em todas as páginas do site (não no painel do WordPress). */
add_action( 'wp_enqueue_scripts', function () {
	$cfg = ba11y_config();
	wp_enqueue_script( 'botao-acessibilidade', plugins_url( 'acessibilidade.js', __FILE__ ), array(), BA11Y_VERSAO, array( 'in_footer' => true, 'strategy' => 'defer' ) );
} );

/** Passa as configurações para o script como atributos data-*. */
add_filter( 'script_loader_tag', function ( $tag, $handle ) {
	if ( 'botao-acessibilidade' !== $handle ) {
		return $tag;
	}
	$cfg   = ba11y_config();
	$attrs = sprintf(
		' data-cor="%s" data-lado="%s" data-libras="%s"',
		esc_attr( $cfg['cor'] ),
		esc_attr( $cfg['lado'] ),
		esc_attr( $cfg['libras'] )
	);
	return str_replace( '<script ', '<script' . $attrs . ' ', $tag );
}, 10, 2 );

/** Tela de configurações: Configurações > Acessibilidade. */
add_action( 'admin_menu', function () {
	add_options_page( 'Botão de Acessibilidade', 'Acessibilidade', 'manage_options', 'botao-acessibilidade', 'ba11y_tela' );
} );

add_action( 'admin_init', function () {
	register_setting( 'ba11y', BA11Y_OPCAO, array(
		'type'              => 'array',
		'sanitize_callback' => 'ba11y_limpar',
		'default'           => array(),
	) );
} );

/** Só aceita valores válidos (cor em hexadecimal, lado e Libras dentro das opções). */
function ba11y_limpar( $entrada ) {
	$entrada = is_array( $entrada ) ? $entrada : array();
	$cor     = sanitize_hex_color( isset( $entrada['cor'] ) ? $entrada['cor'] : '' );
	return array(
		'cor'    => $cor ? $cor : '#1449c7',
		'lado'   => ( isset( $entrada['lado'] ) && 'esquerda' === $entrada['lado'] ) ? 'esquerda' : 'direita',
		'libras' => ( isset( $entrada['libras'] ) && 'sim' === $entrada['libras'] ) ? 'sim' : 'nao',
	);
}

function ba11y_tela() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$cfg = ba11y_config();
	?>
	<div class="wrap">
		<h1>Botão de Acessibilidade</h1>
		<p>O botão aparece na lateral de todas as páginas do site. Cada visitante escolhe as opções que precisa, e a escolha fica salva no aparelho dele.</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'ba11y' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="ba11y-cor">Cor do botão</label></th>
					<td><input type="color" id="ba11y-cor" name="<?php echo esc_attr( BA11Y_OPCAO ); ?>[cor]" value="<?php echo esc_attr( $cfg['cor'] ); ?>" /></td>
				</tr>
				<tr>
					<th scope="row"><label for="ba11y-lado">Lado da tela</label></th>
					<td>
						<select id="ba11y-lado" name="<?php echo esc_attr( BA11Y_OPCAO ); ?>[lado]">
							<option value="direita" <?php selected( $cfg['lado'], 'direita' ); ?>>Direita</option>
							<option value="esquerda" <?php selected( $cfg['lado'], 'esquerda' ); ?>>Esquerda</option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row">Libras (VLibras)</th>
					<td>
						<label><input type="checkbox" name="<?php echo esc_attr( BA11Y_OPCAO ); ?>[libras]" value="sim" <?php checked( $cfg['libras'], 'sim' ); ?> />
						Mostrar a opção de Libras (ferramenta gratuita do governo federal)</label>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Salvar' ); ?>
		</form>
	</div>
	<?php
}

/** Link "Configurações" na lista de plugins. */
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=botao-acessibilidade' ) ) . '">Configurações</a>' );
	return $links;
} );
