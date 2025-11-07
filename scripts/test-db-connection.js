const { connect, testConnection, disconnect } = require('../config/database');

async function test() {
  try {
    console.log('🔌 Đang thử kết nối với SQL Server...\n');
    
    // Test connection
    const success = await testConnection();
    
    if (success) {
      console.log('\n✅ Kết nối database thành công!');
      process.exit(0);
    } else {
      console.log('\n❌ Kết nối database thất bại!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('\n💡 Hãy kiểm tra:');
    console.error('   1. SQL Server đã được cài đặt và đang chạy');
    console.error('   2. Database "QuanLyKhoPhanPhoi_SQLServer" đã tồn tại');
    console.error('   3. Thông tin đăng nhập trong file .env là chính xác');
    console.error('   4. SQL Server đã được cấu hình để chấp nhận kết nối');
    process.exit(1);
  } finally {
    await disconnect();
  }
}

test();





