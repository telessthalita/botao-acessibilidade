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
		'libras'  => 'sim',
		'altura'  => 'meio',
		'tamanho' => 'medio',
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
		' data-cor="%s" data-lado="%s" data-libras="%s" data-altura="%s" data-tamanho="%s"',
		esc_attr( $cfg['cor'] ),
		esc_attr( $cfg['lado'] ),
		esc_attr( $cfg['libras'] ),
		esc_attr( $cfg['altura'] ),
		esc_attr( $cfg['tamanho'] )
	);
	return str_replace( '<script ', '<script' . $attrs . ' ', $tag );
}, 10, 2 );

/** Tela de configurações: item próprio no menu lateral do painel. */
add_action( 'admin_menu', function () {
	add_menu_page(
		'Botão de Acessibilidade',
		'Botão Acessibilidade',
		'manage_options',
		'botao-acessibilidade',
		'ba11y_tela',
		'dashicons-universal-access-alt',
		81 // logo abaixo de Configurações
	);
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
		'libras'  => ( isset( $entrada['libras'] ) && 'sim' === $entrada['libras'] ) ? 'sim' : 'nao',
		'altura'  => ( isset( $entrada['altura'] ) && in_array( $entrada['altura'], array( 'topo', 'baixo' ), true ) ) ? $entrada['altura'] : 'meio',
		'tamanho' => ( isset( $entrada['tamanho'] ) && in_array( $entrada['tamanho'], array( 'pequeno', 'grande' ), true ) ) ? $entrada['tamanho'] : 'medio',
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
		<?php settings_errors(); ?>
		<p>O botão aparece na lateral de todas as páginas do site. Cada visitante escolhe as opções que precisa, e a escolha fica salva no aparelho dele.</p>
		<style>
			.ba11y-adm { display: flex; flex-wrap: wrap; gap: 24px 40px; align-items: flex-start; }
			.ba11y-adm form { flex: 1 1 380px; }
			.ba11y-previa { flex: 0 1 440px; position: sticky; top: 48px; }
			.ba11y-previa h2 { margin-top: 1em; }
			.ba11y-previa iframe { width: 100%; height: 520px; border: 1px solid #c3c4c7; border-radius: 8px; background: #fff; }
		</style>
		<div class="ba11y-adm">
		<form method="post" action="options.php" id="ba11y-form">
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
					<th scope="row"><label for="ba11y-altura">Altura na tela</label></th>
					<td>
						<select id="ba11y-altura" name="<?php echo esc_attr( BA11Y_OPCAO ); ?>[altura]">
							<option value="topo" <?php selected( $cfg['altura'], 'topo' ); ?>>Em cima</option>
							<option value="meio" <?php selected( $cfg['altura'], 'meio' ); ?>>No meio</option>
							<option value="baixo" <?php selected( $cfg['altura'], 'baixo' ); ?>>Embaixo</option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="ba11y-tamanho">Tamanho do botão</label></th>
					<td>
						<select id="ba11y-tamanho" name="<?php echo esc_attr( BA11Y_OPCAO ); ?>[tamanho]">
							<option value="pequeno" <?php selected( $cfg['tamanho'], 'pequeno' ); ?>>Pequeno</option>
							<option value="medio" <?php selected( $cfg['tamanho'], 'medio' ); ?>>Médio</option>
							<option value="grande" <?php selected( $cfg['tamanho'], 'grande' ); ?>>Grande</option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row">Libras (VLibras)</th>
					<td>
						<label><input type="checkbox" id="ba11y-libras" name="<?php echo esc_attr( BA11Y_OPCAO ); ?>[libras]" value="sim" <?php checked( $cfg['libras'], 'sim' ); ?> />
						Mostrar a opção de Libras (ferramenta gratuita do governo federal)</label>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Salvar' ); ?>
		</form>
		<div class="ba11y-previa">
			<h2>Pré-visualização</h2>
			<p class="description">Muda na hora conforme você mexe nas opções. Clique no botão para testar. Para valer no site, clique em Salvar.</p>
			<iframe id="ba11y-previa" title="Pré-visualização do botão de acessibilidade"></iframe>
		</div>
		</div>
		<script>
		( function () {
			var script = <?php echo wp_json_encode( plugins_url( 'acessibilidade.js', __FILE__ ) . '?ver=' . BA11Y_VERSAO ); ?>;
			var form = document.getElementById( 'ba11y-form' );
			var frame = document.getElementById( 'ba11y-previa' );
			function esc( v ) { return String( v ).replace( /[&"<>]/g, function ( c ) { return '&#' + c.charCodeAt( 0 ) + ';'; } ); }
			function montar() {
				var attrs = {
					cor: document.getElementById( 'ba11y-cor' ).value,
					lado: document.getElementById( 'ba11y-lado' ).value,
					altura: document.getElementById( 'ba11y-altura' ).value,
					tamanho: document.getElementById( 'ba11y-tamanho' ).value,
					libras: document.getElementById( 'ba11y-libras' ).checked ? 'sim' : 'nao'
				};
				var data = Object.keys( attrs ).map( function ( k ) { return ' data-' + k + '="' + esc( attrs[ k ] ) + '"'; } ).join( '' );
				frame.srcdoc = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
					// a prévia não salva nada no navegador, para não mexer nas escolhas de quem navega no site
					'<script>try{Object.defineProperty(window,"localStorage",{value:{getItem:function(){return null},setItem:function(){}}})}catch(e){}<\/script>' +
					'<style>body{margin:0;font:16px/1.6 Georgia,serif;color:#222;background:#fafafa}header{background:#1b2a4a;color:#fff;padding:20px}main{padding:16px 20px}p{margin:0 0 1em}</style>' +
					'</head><body><header><strong>Seu site</strong></header><main>' +
					'<p>Este é um texto de exemplo para ver como o botão fica na página.</p>' +
					'<p>Clique no botão da lateral para abrir o painel e testar as opções. <a href="#">Um link de exemplo.</a></p>' +
					'<p>As escolhas feitas aqui na prévia não ficam salvas.</p>' +
					'</main><script src="' + esc( script ) + '"' + data + '><\/script></body></html>';
			}
			var espera;
			form.addEventListener( 'input', function () { clearTimeout( espera ); espera = setTimeout( montar, 200 ); } );
			form.addEventListener( 'change', montar );
			montar();
		} )();
		</script>
	</div>
	<?php
}

/** Link "Configurações" na lista de plugins. */
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'admin.php?page=botao-acessibilidade' ) ) . '">Configurações</a>' );
	return $links;
} );
